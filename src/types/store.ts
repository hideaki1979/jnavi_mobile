/**
 * 店舗情報登録時にAPI送信データの型定義
 */
export interface StoreData {
    // 店舗基本情報
    store_name: string;
    branch_name?: string;
    address: string;
    business_hours: string;
    regular_holidays: string;

    // 事前食券購入有無
    prior_meal_voucher: boolean;

    // トッピングコール補足
    topping_details?: string;
    call_details?: string;

    // 全体増量の有無
    is_all_increased: boolean;

    // ロット制の有無
    is_lot: boolean;
    lot_detail?: string;

    // トッピングとコールオプション情報
    topping_calls?: BaseToppingCall[];
}

/**
 * トッピングコール情報の基底型型定義
 */
export interface BaseToppingCall {
    topping_id: number | string;
    call_option_id: number | string;
    call_timing: "pre_call" | "post_call";
    noodle_type_id: number | string;
}