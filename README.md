# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Build

### Develop

```
wasm-pack build twice
wasm-pack build tic-tac-toe
wasm-pack build connect-four
```

```
npm run start
```

### Test

```
cargo test --all
wasm-pack test --node tic-tac-toe
wasm-pack test --node connect-four
```

### Release

```
wasm-pack build --release twice
wasm-pack build --release tic-tac-toe
npm run build
npm run deploy
```
