const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // ✅ SVG file support
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg", "cjs"], // Add SVG + Firebase compatibility
    unstable_enablePackageExports: false, // Firebase compatibility with Expo SDK 53+
  };

  // ✅ Watch custom asset folder (optional)
  config.watchFolders = [...(config.watchFolders || []), "./src/assets"];

  return config;
})();
