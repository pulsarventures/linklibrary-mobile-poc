const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: assetExts.filter((extension) => extension !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    unstable_allowRequireContext: true,
  },
};

module.exports = mergeConfig(defaultConfig, config);
