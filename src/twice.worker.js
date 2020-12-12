const mod = require('twice');
export async function twice(v) {
  const wasm = await mod;
  return wasm.twice(v);
}
