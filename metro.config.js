const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable package exports resolution to fix "useLatestCallback.default is not a function"
// caused by Metro resolving use-latest-callback to its .mjs ESM file incorrectly.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
