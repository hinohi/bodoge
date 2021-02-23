# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Build

### Develop

```sh
cd crates

for name in */Cargo.toml
do
  wasm-pack build $(dirname $name)
done
```

```sh
npm run start
```

### Test

```sh
cd crates

cargo test --all
for name in */Cargo.toml
do
  wasm-pack test --node $(dirname $name)
done
```

### Release

```sh
cd crates
for name in */Cargo.toml
do
  wasm-pack build --release $(dirname $name)
done
```

```sh
npm run build && npm run deploy
```
