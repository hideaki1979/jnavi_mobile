import ApiClient from "./Apiclient"
import { StoreData } from "../types/store"
import { ApiStoreData, MapApiResponse, MapData, StoreApiResponse, StoreGetApiResponse } from "../types/storeApiResponse"

const api = ApiClient.getInstance()

/**
 * 店舗情報を登録するAPI関数
 * @param storeData 登録する店舗データ
 * @returns APIレスポンス
 */
export const createStore = async (storeData: StoreData): Promise<StoreApiResponse> => {
    try {
        const response = await api.post(`/stores`, storeData)
        console.log("店舗情報登録返却データ：", response.data)
        return response.data

    } catch (error) {
        throw ApiClient.handleError(error, "店舗情報登録時に予期せぬエラーが発生しました")
    }
}

/**
 * 店舗情報を取得するAPI関数
 * @param id 取得する店舗ID
 * @returns 取得した店舗データ
 */
export const getStoreById = async (id: string): Promise<ApiStoreData> => {
    try {
        const response = await api.get<StoreGetApiResponse>(`/stores/${id}`)
        const data = response.data.data
        // メインの店舗データのIDをNumber型に変換
        data.id = Number(data.id)
        // store_topping_callsの各要素を処理
        if (data.store_topping_calls && Array.isArray(data.store_topping_calls)) {
            data.store_topping_calls = data.store_topping_calls.map(item => {
                // store_topping_callsの各IDをNumber型に変換
                item.store_id = Number(item.store_id)
                item.topping_id = Number(item.topping_id)
                item.call_option_id = Number(item.call_option_id)
                item.noodle_type_id = Number(item.noodle_type_id)

                // ネストされたオブジェクトも変換
                if (item.topping) {
                    item.topping.id = Number(item.topping.id)
                }

                if (item.call_option) {
                    item.call_option.id = Number(item.call_option.id)
                }

                if (item.noodle_type) {
                    item.noodle_type.id = Number(item.noodle_type.id)
                }

                return item
            })
        }
        return data

    } catch (error) {
        throw ApiClient.handleError(error, "店舗情報取得時に予期せぬエラーが発生しました")
    }
}

/**
 * Map情報を全件取得するAPI関数
 * @returns 取得したMapデータ
 */
export const getMapAll = async (): Promise<MapData[]> => {
    try {
        const response = await api.get<MapApiResponse>(`/maps`)
        // console.log('Map情報取得データ：', response.data.data)

        const mapDataArray = response.data.data.map((item) => ({
            id: Number(item.id),
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            store: {
                id: Number(item.store.id),
                store_name: item.store.store_name,
                branch_name: item.store.branch_name,
                address: item.store.address
            }
        }))
        // console.log("型変換後Mapデータ：", mapDataArray)
        return mapDataArray

    } catch (error) {
        throw ApiClient.handleError(error, "Map情報取得時に予期せぬエラーが発生しました")
    }
}