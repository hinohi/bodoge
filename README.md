# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Build

### Develop

```
wasm-pack build tic-tac-toe
wasm-pack build connect-four
wasm-pack build mancala
```

```
npm run start
```

### Test

```
cargo test --all
wasm-pack test --node tic-tac-toe
wasm-pack test --node connect-four
wasm-pack test --node mancala
```

### Release

```
wasm-pack build --release tic-tac-toe
wasm-pack build --release connect-four
wasm-pack build --release mancala
npm run build
npm run deploy
```
