import { firebaseAuth } from "../config/firebase"
import { User } from "../types/user"
import ApiClient from "./Apiclient"

const api = ApiClient.getInstance()

/**
 * @description 新しいユーザーを作成します
 * @param user - 作成するユーザーの情報
 * @returns 作成されたユーザーの情報
 * @throws {Error} Firebase認証トークンの取得に失敗
 * @throws {Error} ユーザー情報の保存に失敗
 */
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

/**
 * @description uidに基づいてユーザー情報を取得します
 * @param uid - ユーザーUID
 * @returns void
 */
export const getUserByUid = async (uid: string): Promise<void> => {
    try {
        // Firebase認証トークンの取得
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        if (!idToken) {
            throw new Error('認証トークンの取得に失敗しました')
        }

        const response = await api.get(`/users/${uid}`, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            }
        })
        return response.data

    } catch (error) {
        ApiClient.handleError(
            error,
            'ユーザー情報取得中に予期せぬエラーが発生しました'
        )
    }
}  