# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Build

### Develop

```
npm run start
wasm-pack build twice
wasm-pack build tic-tac-toe
```

### Test

```
cargo test --all
wasm-pack test --node tic-tac-toe
```

### Release

```
wasm-pack build --release twice
wasm-pack build --release tic-tac-toe
npm run build
npm run deploy
```
