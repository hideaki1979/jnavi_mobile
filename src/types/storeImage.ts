// 画像情報アップロード用のデータ型
export interface StoreImageUploadData {
    store_id: number | string;
    menu_type: number;
    menu_name: string;
    image_base64: string | null;
    topping_selections?: {
        topping_id: number | string;
        call_option_id: number | string;
        store_topping_call_id?: number | string;
    }[]
}

// 選択されたトッピングオプション情報の型
export interface SelectedToppingInfo {
    optionId: string | number;
    storeToppingCallId?: string | number;
}

// 画像ダウンロード用の画像情報データ型
export interface StoreImageDownloadData {
    id: number | string;
    store_id: number | string;
    user_id: number | string;
    menu_type: number | string;
    menu_name: string;
    image_url: string;
    topping_calls?: {
        topping_id: number | string;
        topping_name: string;
        call_option_id: number | string;
        call_option_name: string;
    }[];
}

// 画像ダウンロードAPIレスポンスの型
export interface StoreImageDownloadApiResponse {
    status: string;
    message: string;
    data: StoreImageDownloadData[];
}