/**
 * 店舗情報の型定義
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

    // トッピングコール詳細
    topping_garlic: string[];
    topping_vegetable: string[];
    topping_oil: string[];
    topping_soy_sauce: string[];

    // 麺の硬さ
    noodle_fitness: string[];

    // トッピングコール補足
    topping_details?: string;
    call_details?: string;

    // 全体増量の有無
    is_all_increased: boolean;

    // ロット制の有無
    is_lot: boolean;
    lot_detail?: string;
}