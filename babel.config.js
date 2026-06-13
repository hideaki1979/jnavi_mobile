module.exports = {
    presets: [
        'babel-preset-expo',
        '@babel/preset-typescript'
    ]
    // reanimated/worklets の Babel プラグインは SDK 54 の babel-preset-expo が
    // 自動設定する(reanimated 4 でプラグインは react-native-worklets へ移動)。
    // 明示指定すると重複・移動警告の原因になるため記述しない。
  }