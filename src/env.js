// Shim for the `env` module that wasm-bindgen-generated code imports from.
// The `instant` crate (pulled in by mancala's deps) emits an `env.now` import.

export const now = () => Date.now();

export default { now };
