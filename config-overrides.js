// copy from https://github.com/likr-sandbox/convex-hull/blob/master/config-overrides.js

const path = require("path");

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: {loader: "workerize-loader"},
  });

  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push(".wasm");

  config.module.rules.forEach((rule) => {
    (rule.oneOf || []).forEach((oneOf) => {
      if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
        // Make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // Add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, "src"),
    use: [{loader: require.resolve("wasm-loader"), options: {}}],
  });

  return config;
};
