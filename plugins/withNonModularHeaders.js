const { withDangerousMod } = require("expo/config-plugins")
const fs = require("fs")
const path = require("path")

/**
 * SDK 54 + `useFrameworks: "static"`(Firebase が要求)環境で、
 * react-native-maps / GoogleSignIn / Firebase 等の Pod が React のヘッダを
 * 「非モジュラ include」する。static framework module 内では -Werror により
 *   include of non-modular header inside framework module ... RCTComponent.h
 * となり xcodebuild が code 65 で失敗する。
 *
 * 対処: 生成される ios/Podfile の post_install で全 Pod ターゲットに
 *   CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES
 * を付与し、当該診断を許容する(広く使われる定石)。
 *
 * ios/Podfile は CNG(prebuild)で毎回再生成されるため、手編集ではなく
 * config plugin として注入する。冪等(MARKER 既存ならスキップ)。
 * 参考: expo/expo#39607, react-native-maps#5742
 */
const ANCHOR = "post_install do |installer|"
const MARKER = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"
const INJECTION = `
    # injected by plugins/withNonModularHeaders.js — SDK54 static frameworks 対応
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['${MARKER}'] = 'YES'
      end
    end`

module.exports = function withNonModularHeaders(config) {
    return withDangerousMod(config, [
        "ios",
        (cfg) => {
            const podfilePath = path.join(
                cfg.modRequest.platformProjectRoot,
                "Podfile"
            )
            let contents = fs.readFileSync(podfilePath, "utf8")
            if (!contents.includes(MARKER) && contents.includes(ANCHOR)) {
                contents = contents.replace(ANCHOR, ANCHOR + INJECTION)
                fs.writeFileSync(podfilePath, contents)
            }
            return cfg
        },
    ])
}
