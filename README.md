# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Prerequisites

- [mise](https://mise.jdx.dev/) (to install the pinned Node.js runtime)
- pnpm 12 (selected by the `packageManager` field)
- Rust toolchain with the `wasm32-unknown-unknown` target:
  ```
  rustup target add wasm32-unknown-unknown
  ```
- `wasm-bindgen-cli`:
  ```
  cargo install wasm-bindgen-cli --version 0.2.130 --locked
  ```

## Build

### Develop

```
  mise install
  pnpm install
  pnpm dev
```

`pnpm dev` rebuilds the WASM packages (debug) via `scripts/build-wasm.sh` and
then starts Vite. To rebuild WASM only:

```
pnpm build:wasm        # release
pnpm build:wasm:dev    # debug
```

### Test

```
pnpm playwright:install
cargo test --all
pnpm test
```

`pnpm test` runs the Playwright end-to-end suite. Install its browser binaries
once with `pnpm playwright:install` before running it.

### Release

```
pnpm build
pnpm deploy
```

`pnpm build` invokes `scripts/build-wasm.sh` (release) automatically before
running `tsc` and `vite build`.
