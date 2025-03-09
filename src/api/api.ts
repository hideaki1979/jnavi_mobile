import axios from "axios"
import Constants from "expo-constants"
import { StoreData } from "../types/store"
import { Platform } from "react-native"
import { StoreApiResponse } from "../types/storeApiResponse"

const getApiUrl = () => {
    const { configApiUrl } = Constants.expoConfig?.extra || {}

    // 開発環境でのプラットフォーム別でAPI接続URLを切り分け
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3000'
        }
        return 'http://localhost:3000'
    }

    // 設定値またはデフォルト値を返す
    return configApiUrl || 'http://localhost:3000'
}

/**
 * 店舗情報を登録するAPI関数
 * @param storeData 登録する店舗データ
 * @returns APIレスポンス
 */
export const createStore = async (storeData: StoreData): Promise<StoreApiResponse> => {
    // Constantsから設定されたAPIエンドポイントを取得
    const apiUrl = getApiUrl()
    if (!apiUrl) {
        throw new Error('APIのURLが設定されてません！')
    }
    console.log(`API接続先： ${apiUrl}`)
    try {
        const response = await axios.post(`${apiUrl}/stores`, storeData, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response.data

    } catch (error) {
        console.error("店舗登録処理エラー：", error)
        if (axios.isAxiosError(error)) {
            throw new Error(`店舗情報登録時にエラーが発生しました： ${error.response?.data?.message || error.message}`)
        } else {
            throw new Error(`店舗情報登録時に予期せぬエラーが発生しました`)
        }
    }
}

/**
 * 店舗情報を取得するAPI関数
 * @param id 取得する店舗ID
 * @returns 取得した店舗データ
 */
export const getStoreById = async (id: string): Promise<StoreData> => {
    const apiUrl = getApiUrl()
    if (!apiUrl) {
        throw new Error('APIのURLが設定されてません！')
    }

    try {
        const response = await axios.get(`${apiUrl}/stores/${id}`, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response.data

    } catch (error) {
        console.error("店舗情報取得エラー", error)
        if (axios.isAxiosError(error)) {
            throw new Error(`店舗情報取得時にエラーが発生： ${error.response?.data?.message || error.message}`)
        } else {
            throw new Error("店舗情報取得時に予期せぬエラーが発生")
        }
    }
}

// 疎通テスト用テーブル追加処理
export const handleInsert = async (
    InputText: string,
    apiUrl: string | undefined,
    setResult: (result: string) => void
): Promise<void> => {
    if (!apiUrl) {
        setResult('apiUrlが設定されてません！')
        return
    }

    try {
        const response = await axios.post(`${apiUrl}/testinsert`, {
            value: InputText
        })
        setResult(JSON.stringify(response.data))
    } catch (error) {
        console.error("insertError：", error)
        if (axios.isAxiosError(error)) {
            setResult('登録処理時にエラーが発生しました。' + JSON.stringify(error.response?.data))
        } else {
            setResult('登録処理時に想定外のエラーが発生しました。')
        }
    }
}