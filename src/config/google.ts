import { GoogleSignin } from "@react-native-google-signin/google-signin"

// Google認証の初期設定
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
})
