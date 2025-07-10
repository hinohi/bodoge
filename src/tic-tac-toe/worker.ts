import * as Comlink from 'comlink';

const wasmImport = import('crate-tic-tac-toe');

const wasmModule = {
  async initialize() {
    const wasm = await wasmImport;
    Object.assign(wasmModule, wasm);
  },
};

Comlink.expose(wasmModule);

export type ModuleType = typeof import('crate-tic-tac-toe') & typeof wasmModule;
