module.exports = function (api) {
  api.cache(true);
  let plugins = ['nativewind/babel', // Use plugin, not preset
      // 'react-native-worklets/plugin',
      'react-native-reanimated/plugin',];



  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
