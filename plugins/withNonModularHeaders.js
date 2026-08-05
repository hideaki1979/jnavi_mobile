const { withDangerousMod } = require("expo/config-plugins")
// Expo 公式の生成コード注入ヘルパー(トップレベル未公開のため deep import。
// 多数の公式/コミュニティ config plugin で使われる定石。パスが変わっても
// "Cannot find module" で即失敗するためサイレント化はしない)
const {
    mergeContents
} = require("@expo/config-plugins/build/utils/generateCode")
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
 * config plugin として注入する。注入は Expo の `mergeContents` で行う:
 *   - `@generated` マーカー + ハッシュで冪等(再実行・INJECTION 変更にも追従)
 *   - アンカー(post_install)が無ければ ERR_NO_MATCH を throw し prebuild を
 *     即失敗させる(将来 SDK で Podfile 構造が変わった際にサイレント化させない)
 * 参考: expo/expo#39607, react-native-maps#5742
 */
const MARKER = "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES"
const TAG = "withNonModularHeaders"
// スペース差異に強い正規表現アンカー(`post_install do |installer|`)
const ANCHOR = /post_install\s+do\s+\|\s*installer\s*\|/
const INJECTION = `    installer.pods_project.targets.each do |target|
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
            const contents = fs.readFileSync(podfilePath, "utf8")
            // アンカー不一致なら mergeContents が throw(= サイレントスキップを防止)。
            const merged = mergeContents({
                tag: TAG,
                src: contents,
                newSrc: INJECTION,
                anchor: ANCHOR,
                offset: 1, // post_install do |installer| の次行に挿入
                comment: "#"
            })
            // didMerge=false は既に注入済み(冪等)。変更があった時のみ書き戻す。
            if (merged.didMerge) {
                fs.writeFileSync(podfilePath, merged.contents)
            }
            return cfg
        }
    ])
}
