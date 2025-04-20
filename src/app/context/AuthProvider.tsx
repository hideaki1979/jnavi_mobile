import { firebaseAuth } from "@/src/config/firebase"
import { User, AuthContextType } from "@/src/types/user"
import { FirebaseAuthTypes, GoogleAuthProvider, onAuthStateChanged } from "@react-native-firebase/auth"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { router } from "expo-router"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { Alert } from "react-native"

// コンテキストの初期値
const authContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    signInWithEmail: async () => null,
    signInWithGoogle: async () => null
})

// AuthProviderの型定義
type AuthProviderProps = {
    children: ReactNode;
}


/**
 * AuthProvider コンポーネント
 * @description 認証関連の機能を提供する Context Provider コンポーネント
 * @param children React の子要素
 * @returns ReactNode
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)


    /**
     * メール/パスワードでのサインイン
     * @description Firebase Auth を使用して、メールアドレスとパスワードでサインインを実行します
     * @param email メールアドレス
     * @param password パスワード
     * @returns Promise<string | null> user.uid またはエラーメッセージ
     * @throws Error if sign in fails
     */
    const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
        try {
            // Firebaseでのメール/パスワード認証
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password)
            return userCredential.user.uid
        } catch (error) {
            console.log('サインインエラー：', error)

            // エラーハンドリング
            let errorMessage = 'サインインに失敗しました'
            if (typeof error === 'object' && error !== null && 'code' in error) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'メールアドレス形式で入力してください'
                        break
                    case 'auth/user-not-found':
                    case 'auth/invalid-password':
                        errorMessage = 'メールアドレスまたはパスワードに誤りがあります'
                        break
                    case 'auth/too-many-requests':
                        errorMessage = 'ログイン試行回数が限界値に達しました。\nしばらく経ってから再試行してください'
                        break
                    default:
                        errorMessage = `サインインに失敗しました。${error.code}`
                }
            }
            Alert.alert('サインインエラー', errorMessage, [{ text: 'OK' }])
            return null
        }
    }


    /**
     * Google認証を使用してサインイン
     * @description GoogleSignin を使用して、Google認証を実行します
     * @returns Promise<string | null> user.uid またはエラーメッセージ
     * @throws Error if sign in fails
     */
    const signInWithGoogle = async (): Promise<string | null> => {
        try {
            // 既存のGoogleセッションをクリア
            const isSignedIn = GoogleSignin.hasPreviousSignIn()
            if (isSignedIn) {
                await signOut()
            }

            // Google Play Servicesの確認
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

            // Google認証を実行
            const signInResult = await GoogleSignin.signIn()
            const idToken = signInResult.data?.idToken

            if (!idToken) {
                throw new Error('Google認証トークンIDがありません')
            }

            // Firebaseクレデンシャルを作成してサインイン
            const googleCredential = GoogleAuthProvider.credential(idToken)
            const userCredential = firebaseAuth.signInWithCredential(googleCredential)
            return (await userCredential).user.uid
        } catch (error) {
            console.error('Google認証サインインエラー：', error)
            let errorMessage = ''
            if (error instanceof Error) {
                errorMessage = `Google認証サインインエラー： ${error.message} ${error.name}`
            }
            Alert.alert('Google認証エラー', errorMessage, [{ text: 'OK' }])
            return null
        }
    }


    /**
     * ログアウト
     * @description GoogleSignin からサインアウトし、Firebase Auth からサインアウトします。
     * その後、店舗マップ画面に遷移します。
     */
    const signOut = async () => {
        try {
            await GoogleSignin.signOut()
            await firebaseAuth.signOut()
            // router.replace('auth/signin')
            router.replace('store/map')
        } catch (error) {
            console.error('ログアウトエラー：', error)
        }
    }

    // 認証状態の監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (authUser: FirebaseAuthTypes.User | null) => {
            if (authUser) {
                // Firebase User 型からアプリケーションの User 型へ変換
                const user: User = {
                    uid: authUser.uid,
                    email: authUser.email || '',
                    displayName: authUser.displayName || '',
                    authProvider: authUser.providerId
                }
                setUser(user)
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        // クリーンアップ関数
        return () => unsubscribe()
    }, [])

    // コンテキストの値
    const value = {
        user,
        loading,
        signOut,
        signInWithEmail,
        signInWithGoogle
    }

    return <authContext.Provider value={value}>{children}</authContext.Provider>

}
// カスタムコールフック
export const useAuth = () => useContext(authContext)