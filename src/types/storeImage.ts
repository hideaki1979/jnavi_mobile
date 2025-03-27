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