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