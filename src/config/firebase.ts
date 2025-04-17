import firebase from "@react-native-firebase/app"
import { getAuth } from "@react-native-firebase/auth"

// アプリインスタンスのエクスポート
export const firebaseApp = firebase.app()

// authのエクスポート
export const firebaseAuth = getAuth()