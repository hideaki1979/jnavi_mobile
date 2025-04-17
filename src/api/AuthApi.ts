import { firebaseAuth } from "../config/firebase"
import { User } from "../types/user"
import ApiClient from "./Apiclient"

const api = ApiClient.getInstance()

export const createUser = async (user: User): Promise<void> => {
    try {
        // Firebase認証トークンの取得
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        if (!idToken) {
            throw new Error('認証トークンの取得に失敗しました')
        }

        const response = await api.post('/users', user, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        })
        return response.data
    } catch (error) {
        ApiClient.handleError(
            error,
            "ユーザー情報登録時に予期せぬエラーが発生しました"
        )
    }
}