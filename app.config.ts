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
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
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
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
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
        "@react-native-firebase/app",
        "@react-native-firebase/auth",
        "@react-native-google-signin/google-signin",
        [
            "expo-build-properties",
            {
                ios: {
                    useFrameworks: "static",
                    // SDK54 既知問題: useFrameworks:static + RN プリコンパイル済みバイナリで
                    // 「must be imported from module ... before it is required」が発生する
                    // (react-native-maps 等)。Expo 公式の暫定対処として RN をソースビルドする。
                    // 参考: expo/expo#39233
                    buildReactNativeFromSource: true
                }
            }
        ],
        "expo-font",
        // SDK54 + useFrameworks:static の非モジュラヘッダ問題(react-native-maps等)対処
        "./plugins/withNonModularHeaders"
    ]
})