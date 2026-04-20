#!/usr/bin/env bash
# Build WASM packages using wasm-bindgen-cli directly (wasm-pack replacement).
#
# Usage:
#   scripts/build-wasm.sh [--dev]
#
# Without flags it performs a release build (default). Pass --dev for a debug build.

set -euo pipefail

PROFILE="release"
CARGO_PROFILE_FLAG="--release"
TARGET_SUBDIR="release"

for arg in "$@"; do
    case "$arg" in
        --dev)
            PROFILE="dev"
            CARGO_PROFILE_FLAG=""
            TARGET_SUBDIR="debug"
            ;;
        *)
            echo "unknown argument: $arg" >&2
            exit 1
            ;;
    esac
done

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# crate_dir:snake_case_name (snake_case must match the produced .wasm file name)
CRATES=(
    "tic-tac-toe:tic_tac_toe"
    "connect-four:connect_four"
    "mancala:mancala"
)

CARGO_PACKAGES=()
for entry in "${CRATES[@]}"; do
    CARGO_PACKAGES+=("-p" "${entry%%:*}")
done

# mancala's upstream deps pull in getrandom 0.3 which requires this cfg for
# wasm32-unknown-unknown. Harmless for the other crates.
export RUSTFLAGS="${RUSTFLAGS:-} --cfg getrandom_backend=\"wasm_js\""

echo ">>> cargo build --target wasm32-unknown-unknown $CARGO_PROFILE_FLAG ${CARGO_PACKAGES[*]}"
cargo build --target wasm32-unknown-unknown $CARGO_PROFILE_FLAG "${CARGO_PACKAGES[@]}"

WASM_OUT_DIR="target/wasm32-unknown-unknown/${TARGET_SUBDIR}"

for entry in "${CRATES[@]}"; do
    crate_dir="${entry%%:*}"
    snake="${entry##*:}"
    pkg_dir="${crate_dir}/pkg"
    wasm_input="${WASM_OUT_DIR}/${snake}.wasm"

    if [[ ! -f "$wasm_input" ]]; then
        echo "missing ${wasm_input}" >&2
        exit 1
    fi

    rm -rf "$pkg_dir"
    mkdir -p "$pkg_dir"

    echo ">>> wasm-bindgen ${wasm_input} --out-dir ${pkg_dir} --out-name ${snake}"
    wasm-bindgen \
        --target bundler \
        --out-dir "$pkg_dir" \
        --out-name "$snake" \
        "$wasm_input"

    # Minimal package.json so the local file: dep in the root package.json resolves.
    cat >"${pkg_dir}/package.json" <<EOF
{
  "name": "crate-${crate_dir}",
  "version": "0.1.0",
  "type": "module",
  "main": "${snake}.js",
  "module": "${snake}.js",
  "types": "${snake}.d.ts",
  "sideEffects": [
    "./${snake}.js",
    "./snippets/*"
  ]
}
EOF
done

echo ">>> WASM build complete (${PROFILE})"
