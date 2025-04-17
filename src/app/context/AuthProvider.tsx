import { firebaseAuth } from "@/src/config/firebase"
import { User, AuthContextType } from "@/src/types/user"
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { router } from "expo-router"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

// コンテキストの初期値
const authContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { }
})

// AuthProviderの型定義
type AuthProviderProps = {
    children: ReactNode;
}

// AuthProviderコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // サインアウト処理
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
                    displayName: authUser.displayName || ''
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
        signOut
    }

    return <authContext.Provider value={value}>{children}</authContext.Provider>

}
// カスタムコールフック
export const useAuth = () => useContext(authContext)