import {
    ToppingApiResponse, CallOptionApiResponse,
    ToppingData,
    CallOptionData,
    ResultToppingCallApiRes,
    ResultToppingCall
} from "../types/topping"
import ApiClient from "./Apiclient"

const api = ApiClient.getInstance()

/**
 * トッピング一覧を取得する
 * @returns トッピング一覧のレスポンス
 */
export const getToppings = async (): Promise<ToppingData[]> => {
    try {
        const response = await api.get<ToppingApiResponse>(`/toppings`)
        const toppingDataArray = response.data.data.map((item) => ({
            id: Number(item.id),
            topping_name: item.topping_name,
            topping_category: item.topping_category

        }))
        return toppingDataArray
    } catch (error) {
        throw ApiClient.handleError(error, "トッピング情報取得中にエラーが発生しました。")
    }
}

/**
 * コールオプション一覧を取得する
 * @returns コールオプション一覧のレスポンス
 */
export const getCallOptions = async (): Promise<CallOptionData[]> => {
    try {
        const response = await api.get<CallOptionApiResponse>(`/calloptions`)
        const callOptionArray = response.data.data.map((item) => ({
            id: Number(item.id),
            call_category: item.call_category,
            call_option_name: item.call_option_name
        }))
        return callOptionArray
    } catch (error) {
        throw ApiClient.handleError(error, "コールオプション情報取得時にエラーが発生しました。")
    }
}

export const getToppingCallOptions = async (): Promise<ResultToppingCall[]> => {
    try {
        const response = await api.get<ResultToppingCallApiRes>(`/toppings/calloptions/formatted`)
        return response.data.data
    } catch (error) {
        throw ApiClient.handleError(error, "トッピング・コールオプション情報取得時にエラーが発生しました。")
    }
}