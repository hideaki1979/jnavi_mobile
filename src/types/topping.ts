/**
 * トッピング情報の型定義
 */
export interface ToppingData {
    id: number;
    topping_category: number;
    topping_name: string;
}

/**
 * コールオプション情報の型定義
 */
export interface CallOptionData {
    id: number;
    call_category: number;
    call_option_name: string;
}

/**
 * トッピング情報取得APIレスポンスの型定義
 */
export interface ToppingApiResponse {
    data: ToppingData[];
    status: string;
    message: string;
}

/**
 * コールオプション情報取得APIレスポンスの型定義
*/
export interface CallOptionApiResponse {
    data: CallOptionData[];
    status: string;
    message: string;
}

