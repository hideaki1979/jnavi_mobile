/**
 * 店舗登録画面APIレスポンスの型定義（店舗のみ）
 */
export interface ApiStoreData {
    id: string;
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
    created_at: string;
    updated_at: string;
}

/**
 * 店舗登録画面APIレスポンスの型定義
 * （サーバから正式に返ってくる値（maps、ステータス、メッセージ））
 */
export interface StoreApiResponse {
    data: {
        store: ApiStoreData;
        map: {
            id: string;
            store_id: string;
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
    branch_name: string | null;
    address: string;
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