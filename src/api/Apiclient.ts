import axios, { AxiosError, AxiosInstance } from "axios"
import Constants from "expo-constants"
import { Platform } from "react-native"

/**
 * APIクライアントの設定を行うクラス
 */
class ApiClient {
    private static instance: AxiosInstance

    /**
   * APIのベースURLを環境に応じて取得
   */
    private static getBaseUrl(): string {
        const { apiUrl } = Constants.expoConfig?.extra || {}

        // 開発環境でのプラットフォーム別でAPI接続URLを切り分け
        if (__DEV__) {
            if (Platform.OS === "android") {
                return 'http://10.0.2.2:3000'
            }
            return 'http://localhost:3000'
        }

        // 設定値またはデフォルト値を返す
        return apiUrl || 'http://localhost:3000'
    }

    /* 
   * APIクライアントのシングルトンインスタンスを取得
   */
    public static getInstance(): AxiosInstance {
        if (!ApiClient.instance) {
            ApiClient.instance = axios.create({
                baseURL: ApiClient.getBaseUrl(),
                headers: {
                    "Content-Type": "application/json"
                }
            })
        }
        return ApiClient.instance
    }

    /**
   * エラーハンドラー
   */
    public static handleError(
        error: unknown,
        defaultMessage: string = "予期せぬエラーが発生しました。"
    ): Error {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ message?: string }>
            return new Error(
                `API呼び出し中にエラーが発生： ${axiosError.response?.data?.message || axiosError.message}`
            )
        }

        if (error instanceof Error) {
            return error
        }

        return new Error(defaultMessage)
    }
}

export default ApiClient