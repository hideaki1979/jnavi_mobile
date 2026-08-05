import { ExpoConfig, ConfigContext } from "expo/config"
import dotenv from "dotenv"

dotenv.config()

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: config.name ?? "jNavi",
    slug: config.slug ?? "jNavi",
    scheme: config.scheme ?? "jnavi",
    android: {
        ...config.android,
        // 既に app.json に記載がある場合も上書きしないようにする
        config: {
            ...config.android?.config,
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
            }
        },
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON
            ?? "./google-services.json"
    },
    ios: {
        ...config.ios,
        bundleIdentifier: config.ios?.bundleIdentifier,
        config: {
            ...config.ios?.config,
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
        },
        googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST
            ?? "./GoogleService-Info.plist"
    },
    extra: {
        ...config.extra,
        apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
    },
    plugins: [
        [
            "expo-router",
            {
                root: "./src/app"
            }
        ],
        // react-native-maps 1.27.x は iOS podspec を単一化し Google Maps を
        // `react-native-maps/Google` subspec に変更した。Expo 組み込みの旧 maps
        // フォールバック(@expo/config-plugins ios/Maps.js)は今も廃止済みの
        // `pod 'react-native-google-maps'` を生成するため pod install が
        // 「No podspec found for react-native-google-maps」で失敗する。
        // react-native-maps が同梱する公式 config plugin を plugins 配列に
        // 明示登録すると、(1) 正しい `pod 'react-native-maps/Google'` 生成、
        // (2) iOS GMSApiKey / AppDelegate GMSServices.provideAPIKey、
        // (3) Android の geo API_KEY meta-data を設定し、かつ run-once dedup で
        // Expo 組み込みフォールバックがスキップされる。API キーは props で渡す。
        [
            "react-native-maps",
            {
                iosGoogleMapsApiKey:
                    process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY",
                androidGoogleMapsApiKey:
                    process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
            }
        ],
        "@react-native-firebase/app",
        "@react-native-firebase/auth",
        "@react-native-google-signin/google-signin",
        [
            "expo-build-properties",
            {
                ios: {
                    useFrameworks: "static"
                    // SDK54 で expo/expo#39233(useFrameworks:static + RN プリコンパイル
                    // 済みバイナリで「must be imported from module ... before it is
                    // required」, react-native-maps 等)の回避として
                    // `buildReactNativeFromSource: true` を入れていたが、SDK56 + Xcode
                    // 26.5 + RN 0.85 で #39233 が解消したため撤去した。撤去版で
                    // iPhone 16 Pro シミュレータ向け expo run:ios が Build Succeeded
                    // (0 error)を確認済み(2026-06-14)。precompiled RN を使うため
                    // 初回ビルドが大幅短縮。再発時のみ復活する。
                }
            }
        ],
        "expo-font",
        // SDK56 で expo-asset / expo-image / expo-status-bar が config plugin を
        // 持つようになり、`expo install --fix` が plugins 配列への明示登録を要求する
        // (動的設定 app.config.ts には自動追記できないため手動追加)。いずれも
        // 一級 Expo プラグインで、ネイティブのアセット埋め込み・画像・ステータスバー
        // 設定を prebuild に適用する。
        "expo-asset",
        "expo-image",
        "expo-status-bar",
        // SDK56 で app.json トップレベルの `splash` プロパティが config schema
        // から廃止された(expo-doctor の schema チェックが additional property
        // 'splash' で fail)。splash は expo-splash-screen の config plugin 経由で
        // 設定する方式に移行。
        //
        // legacy(SDK55まで)の `resizeMode: "contain"` は**画面全体**を基準に
        // 効いていたが、plugin 方式では **`imageWidth` の枠**が基準になる。
        // imageWidth 未指定だと既定の 100pt で描画され、iPhone 16 Pro(画面幅
        // 393pt)では約1/4に縮小されてしまう(2026-08-05 の実機QAで検出。
        // 生成された ios/jNavi/SplashScreen.storyboard のロゴ frame が
        // width=100 height=100 になっていた)。
        //
        // また splash-icon.png は 1024x1024 全面にベージュ(#E5C89A、四隅を
        // 実測)の背景を持つため、backgroundColor が #ffffff のままだと白地に
        // ベージュの四角が浮いて見える。legacy では画像が画面幅いっぱいに
        // 広がっていたので、この不一致は表面化していなかった。
        //
        // → imageWidth を画面幅相当まで広げ、backgroundColor を画像の地色に
        //   揃えることで legacy と同等の見た目に戻す。
        [
            "expo-splash-screen",
            {
                image: "./assets/splash-icon.png",
                resizeMode: "contain",
                imageWidth: 400,
                backgroundColor: "#E5C89A"
            }
        ],
        // 音声入力(音声→テキスト)。expo-speech-recognition は config plugin 方式で
        // New Architecture(RN0.85)対応・SDK56 を公式サポート(latest 56.0.x)。
        // iOS は NSMicrophoneUsageDescription / NSSpeechRecognitionUsageDescription、
        // Android は RECORD_AUDIO 権限と <queries> をこのプラグインが prebuild に注入する。
        [
            "expo-speech-recognition",
            {
                microphonePermission:
                    "音声入力のためにマイクの使用を許可してください。",
                speechRecognitionPermission:
                    "音声をテキストに変換するために音声認識の使用を許可してください。",
                androidSpeechServicePackages: [
                    "com.google.android.googlequicksearchbox"
                ]
            }
        ],
        // SDK54 + useFrameworks:static の非モジュラヘッダ問題(react-native-maps等)対処
        "./plugins/withNonModularHeaders"
    ]
})