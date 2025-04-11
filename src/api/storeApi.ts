import ApiClient from "./Apiclient"
import { StoreData } from "../types/store"
import {
    MapApiResponse,
    MapData,
    StoreApiResponse,
    SimulationSelectStoresData,
    SimulationSelectStoresApiRes,
    SimulationSelectToppingCallsApiRes,
    SimulationSelectToppingCallsData,
    FormattedToppingOptionNameStoreDataApiRes,
    FormattedToppingOptionNameStoreData
} from "../types/storeApiResponse"

const api = ApiClient.getInstance()

/**
 * 店舗情報を登録するAPI関数
 * @param storeData 登録する店舗データ
 * @returns APIレスポンス
 */
export const createStore = async (
    storeData: StoreData
): Promise<StoreApiResponse> => {
    try {
        const response = await api.post(`/stores`, storeData)
        // console.log("店舗情報登録返却データ：", response.data)
        return response.data
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "店舗情報登録時に予期せぬエラーが発生しました"
        )
    }
}

/**
 * 店舗情報を取得するAPI関数
 * @param id 取得する店舗ID
 * @returns 取得した店舗データ
 */
export const getStoreById = async (id: string): Promise<FormattedToppingOptionNameStoreData> => {
    try {
        const response = await api.get<FormattedToppingOptionNameStoreDataApiRes>(`/stores/${id}`)
        const data = response.data.data
        // console.log("店舗ID検索結果：", JSON.stringify(data, null, 2))
        return data
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "店舗情報取得時に予期せぬエラーが発生しました"
        )
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
        throw ApiClient.handleError(
            error,
            "Map情報取得時に予期せぬエラーが発生しました"
        )
    }
}

/**
 * シミュレーション用の店舗情報を全件取得するAPI関数
 * @returns 取得した店舗情報の配列
 */
export const getStoresAll = async (): Promise<SimulationSelectStoresData[]> => {
    try {
        const response = await api.get<SimulationSelectStoresApiRes>("/stores")
        const storesArray = response.data.data.map(
            (store: SimulationSelectStoresData) => ({
                id: store.id,
                store_name: store.store_name,
                branch_name: store.branch_name
            })
        )
        return storesArray
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "Map情報取得時に予期せぬエラーが発生しました"
        )
    }
}

/**
 * 店舗別のトッピングコール情報を取得するAPI関数
 * 
 * 指定された店舗IDとコールタイミングに基づいて、店舗別のトッピングコール情報を取得します。
 * 
 * @param id 取得する店舗のID
 * @param callTiming コールタイミング（"pre_call" または "post_call"）
 * @returns 指定された店舗のトッピングコールデータ
 * @throws 店舗情報・店舗別コールトッピング取得時に予期せぬエラーが発生した場合
 */
export const getStoreToppingCalls = async (id: string, callTiming: string): Promise<SimulationSelectToppingCallsData> => {
    try {
        const response = await api.get<SimulationSelectToppingCallsApiRes>(`/stores/${id}/toppingcalls`, {
            params: {
                call_timing: callTiming
            }
        })
        // console.log("店舗別トッピングコール情報（店舗単位全レコード）：", response.data.data)
        return response.data.data
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "店舗情報・店舗別コールトッピング（事前／着丼前）情報取得時に予期せぬエラーが発生しました"
        )
    }
}

export const updateStore = async (id: string, storeData: StoreData): Promise<StoreApiResponse> => {
    try {
        const response = await api.put(`/stores/${id}`, storeData)
        return response.data
    } catch (error) {
        throw ApiClient.handleError(
            error,
            "店舗情報、店舗別コールトッピング更新時に予期せぬエラーが発生しました"
        )
    }
}

