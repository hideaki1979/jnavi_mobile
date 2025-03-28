import { StoreImageDownloadData, StoreImageUploadData } from "../types/storeImage"
import ApiClient from "./Apiclient"

const api = ApiClient.getInstance()

/**
 * 店舗画像情報をアップロードするAPI関数
 * @param imageData アップロードする画像データ
 * @returns APIレスポンス
 */
export const uploadStoreImage = async (storeId: string | number, imageData: StoreImageUploadData) => {
    try {
        const response = await api.post(`/stores/${storeId}/images`, imageData)
        return response.data
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "画像情報のアップロード処理でエラーが発生しました。"
        )
    }
}

/**
 * 店舗に関連する画像情報を取得するAPI関数
 * @param storeId 店舗ID
 * @returns 画像情報の配列
 */
export const getStoreImages = async (storeId: string): Promise<StoreImageDownloadData[]> => {
    try {
        const response = await api.get(`/stores/${storeId}/images`)
        // console.log("店舗画像情報：", response.data.data)
        return response.data.data || []
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "店舗画像情報取得時にエラーが発生しました。"
        )
    }
}