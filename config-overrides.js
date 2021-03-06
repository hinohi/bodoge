const path = require("path");

const WorkerPlugin = require('worker-plugin');

module.exports = function override(config, env) {
  const wasmExtensionRegExp = /\.wasm$/;

  config.module.rules.forEach(o => {
    (o.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.includes('file-loader')) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  config.resolve.extensions.push('.wasm');

  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [{loader: require.resolve('wasm-loader'), options: {}}]
  });

  config.plugins.push(new WorkerPlugin({
    filename: '[name].[hash].worker.js',
    chunkFilename: '[name].[hash].chunk.worker.js',
  }));

  return config;
};
