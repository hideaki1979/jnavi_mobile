import axios, { AxiosError, AxiosInstance } from "axios"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { firebaseAuth } from "../config/firebase"
import { ApiErrorDetail, ApiErrorResponse } from "../types/api"

/**
 * API から返されたエラーを、ステータスコードとフィールド単位の詳細を保ったまま伝えるError
 *
 * 素の Error ではステータスコードも details も失われ、
 * 「400 はリトライ対象外」「details[].path でインラインエラーを出す」といった
 * 呼び出し元の判断ができなくなるため、専用の型で保持する。
 */
export class ApiError extends Error {
    /** HTTP ステータスコード（レスポンスを受け取れなかった場合は undefined） */
    readonly status?: number
    /** バリデーションエラー時のフィールド単位の詳細 */
    readonly details?: ApiErrorDetail[]

    constructor(message: string, status?: number, details?: ApiErrorDetail[]) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.details = details
        Object.setPrototypeOf(this, ApiError.prototype)
    }

    /** フィールド単位のエラー詳細を持つか（＝フォームにインライン表示できるか） */
    get hasFieldErrors(): boolean {
        return !!this.details?.length
    }

    /**
     * そのまま画面に出せるメッセージ
     * details があればフィールド単位のメッセージを、無ければ本文を返す
     */
    get displayMessage(): string {
        if (!this.details?.length) return this.message
        return this.details.map((detail) => detail.msg).join("\n")
    }
}

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

            // 店舗の登録・更新・閉店・画像アップロードは API 側で authenticateUser が
            // 必須のため、全リクエストに Firebase の ID トークンを付与する。
            // getIdToken() は有効期限内ならキャッシュを返すので毎回の通信は発生しない。
            // 未ログイン時はヘッダを付けず、認証不要な参照系APIはそのまま通す。
            ApiClient.instance.interceptors.request.use(async (config) => {
                try {
                    const idToken = await firebaseAuth.currentUser?.getIdToken()
                    if (idToken) {
                        config.headers.set("Authorization", `Bearer ${idToken}`)
                    }
                } catch (error) {
                    // トークン更新の失敗でリクエスト自体を止めない。
                    // 認証不要な参照系APIは通し、認証必須のAPIはサーバが
                    // 401 と理由付きのメッセージを返す。
                    console.warn("認証トークンの取得に失敗しました：", error)
                }
                return config
            })
        }
        return ApiClient.instance
    }

    /**
   * エラーハンドラー
   *
   * API のエラー本文はメッセージのキーが出所ごとに `error` / `message` と異なる
   * （types/api.ts の ApiErrorResponse を参照）。両方を見て取り出し、
   * ステータスコードと details を保持した ApiError に詰め替える。
   */
    public static handleError(
        error: unknown,
        defaultMessage: string = "予期せぬエラーが発生しました。"
    ): ApiError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiErrorResponse>
            const data = axiosError.response?.data

            // レスポンス本文が無い（通信断・タイムアウト等）場合は、
            // axios の英語メッセージではなく呼び出し元が用意した文言を表示する
            const message = data?.error || data?.message || defaultMessage

            return new ApiError(message, axiosError.response?.status, data?.details)
        }

        if (error instanceof ApiError) {
            return error
        }

        if (error instanceof Error) {
            return new ApiError(error.message)
        }

        return new ApiError(defaultMessage)
    }
}

export default ApiClient
