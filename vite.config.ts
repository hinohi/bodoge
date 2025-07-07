import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { comlink } from 'vite-plugin-comlink';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), comlink()],
  base: '/bodoge/',
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), comlink()],
  },
  resolve: {
    alias: {
      'crate-tic-tac-toe': '/tic-tac-toe/pkg',
      'crate-connect-four': '/connect-four/pkg',
      'crate-mancala': '/mancala/pkg',
    },
  },
});
