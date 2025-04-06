import { BaseToppingCall } from "./store"
import { FormattedToppingOptionNames } from "./topping"

// トッピング情報の型定義
export interface StoreToppingCall extends BaseToppingCall {
    store_id: string | number;
    topping: {
        id: string | number;
        topping_category: number;
        topping_name: string;
    };
    call_option: {
        id: string | number;
        call_category: number;
        call_option_name: string;
    };
    noodle_type: {
        id: string | number;
        noodle_type_name: string;
    };
}

/**
 * 店舗登録画面の型定義（店舗情報+店舗別トッピングコール情報）
 */
export interface ApiStoreData {
    id: string | number;
    store_name: string;
    branch_name?: string;
    address: string;
    business_hours: string;
    regular_holidays: string;
    prior_meal_voucher: boolean;
    is_all_increased: boolean;
    is_lot: boolean;
    topping_details?: string;
    call_details?: string;
    lot_detail?: string;
    created_at?: string;
    updated_at?: string;
    store_topping_calls?: StoreToppingCall[];
}

/**
 * 店舗登録画面APIレスポンスの型定義
 * （サーバから正式に返ってくる値（maps、ステータス、メッセージ））
 */
export interface StoreApiResponse {
    data: {
        store: ApiStoreData;
        map: {
            id: string | number;
            store_id: string | number;
            latitude: string;
            longitude: string;
            created_at: string;
            updated_at: string;
        }
    }
    message: string;
    status: string;
}

/**
 * 店舗詳細画面APIレスポンスの型定義
 * （サーバから正式に返ってくる値（stores、ステータス、メッセージ））
 */
export interface StoreGetApiResponse {
    data: ApiStoreData;
    message: string;
    status: string;
}

// マップデータの型定義
// 店舗情報
export interface MapStore {
    id: string | number;
    store_name: string;
    branch_name?: string | null;
    address: string;
    images?: string[] | null
}

// マップ＋店舗情報（MAP画面用）
export interface MapData {
    id: string | number;
    latitude: number;
    longitude: number;
    store: MapStore;
}

// MAP情報取得APIレスポンスの型定義
export interface MapApiResponse {
    status: string;
    message: string;
    data: MapData[];
}

// シミュレーション用の店舗データ（食券購入で店舗全件取得：getStoresAll）
export interface SimulationSelectStoresData {
    id: string | number;
    store_name: string;
    branch_name?: string | null;
}
export interface SimulationSelectStoresApiRes {
    data: SimulationSelectStoresData[];
    status: string;
    message: string;
}

// シミュレーション・画像画面用の店舗データ（事前トッピング／着丼前トッピング：getStoreToppingCalls）
export interface SimulationSelectToppingCallsData {
    store_id: string | number;
    store_name: string;
    branch_name?: string | null;
    formattedToppingOptions?: [number, SimulationToppingOption][];
}
export interface SimulationSelectToppingCallsApiRes {
    data: SimulationSelectToppingCallsData;
    status: string;
    message: string;
}

export interface SimulationToppingOption {
    toppingId: string | number;
    toppingName: string;
    options: {
        optionId: string | number;
        optionName: string;
        storeToppingCallId?: string | number;
    }[]
}

// （店舗詳細画面用）整形済店舗・トッピングコール情報（getStoreById）
export interface FormattedToppingOptionNameStoreData {
    // StoreDataの店舗別トッピングコール情報以外の全プロパティ
    id: number;
    store_name: string;
    branch_name?: string | null;
    address: string;
    business_hours: string;
    regular_holidays: string;
    prior_meal_voucher: boolean;
    topping_details?: string | null;
    call_details?: string | null;
    is_all_increased: boolean;
    is_lot: boolean;
    lot_detail?: string | null;

    // （トッピング・オプション）整形済名称リスト
    preCallFormatted: FormattedToppingOptionNames;
    postCallFormatted: FormattedToppingOptionNames;
}

// （店舗詳細画面用）整形済店舗・トッピングコールAPIレスポンス情報（getStoreById）
export interface FormattedToppingOptionNameStoreDataApiRes {
    data: FormattedToppingOptionNameStoreData;
    status: string;
    message: string;
}