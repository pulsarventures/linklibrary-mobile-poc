/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          tests: ['./tests/'],
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        root: ['./src'],
      },
    ],
    [
      'module:react-native-dotenv',
      {
        allowUndefined: true,
        blacklist: null,
        moduleName: '@env',
        path: '.env',
        safe: false,
        whitelist: ['API_URL_DEV', 'API_URL_PROD', 'GOOGLE_CLIENT_ID', 'IOS_CLIENT_ID'],
      },
    ],
    'react-native-reanimated/plugin',
  ],
  presets: ['module:@react-native/babel-preset'],
};
