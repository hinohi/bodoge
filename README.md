# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Prerequisites

- Node.js (for the frontend)
- Rust toolchain with the `wasm32-unknown-unknown` target:
  ```
  rustup target add wasm32-unknown-unknown
  ```
- `wasm-bindgen-cli`:
  ```
  cargo install wasm-bindgen-cli
  ```

## Build

### Develop

```
npm install
npm run dev
```

`npm run dev` rebuilds the WASM packages (debug) via `scripts/build-wasm.sh` and
then starts Vite. To rebuild WASM only:

```
npm run build:wasm        # release
npm run build:wasm:dev    # debug
```

### Test

```
cargo test --all
npm run test
```

### Release

```
npm run build
npm run deploy
```

`npm run build` invokes `scripts/build-wasm.sh` (release) automatically before
running `tsc` and `vite build`.
