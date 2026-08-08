/**
 * 店舗情報のテキスト項目の文字数上限
 *
 * API 側の storeValidationRules と一致させること。
 * 255 は DB の VarChar(255) 由来、1000 は Text 型（DB 上限なし）に対して
 * アプリ側で定めた自由記述欄の妥当値。
 */
export const STORE_TEXT_MAX_LENGTH = {
    STORE_NAME: 255,
    BRANCH_NAME: 255,
    ADDRESS: 255,
    BUSINESS_HOURS: 255,
    REGULAR_HOLIDAYS: 255,
    TOPPING_DETAILS: 1000,
    CALL_DETAILS: 1000,
    LOT_DETAIL: 1000
} as const
