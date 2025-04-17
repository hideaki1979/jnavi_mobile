import { ExpoConfig, ConfigContext } from "expo/config"
import dotenv from "dotenv"

dotenv.config()

export default ({ config }: ConfigContext): ExpoConfig => {
    // EASで定義しているシークレット環境変数
    const googleServicesFileContent = process.env.GOOGLE_SERVICES_JSON
    const googleServicesPlistContent = process.env.GOOGLE_SERVICES_PLIST

    return {
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
            googleServicesFile: googleServicesFileContent
                ? googleServicesFileContent
                : "./google-services.json"
        },
        ios: {
            ...config.ios?.config,
            bundleIdentifier: config.ios?.bundleIdentifier,
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "YOUR_FALLBACK_KEY"
            },
            googleServicesFile: googleServicesPlistContent
                ? googleServicesPlistContent
                : "./GoogleService-Info.plist"
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
                        useFrameworks: "static"
                    }
                }
            ]
        ]
    }
}