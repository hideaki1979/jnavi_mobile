import { Path } from "react-hook-form"
import { StoreData } from "../types/store"

/**
 * 店舗フォームが入力欄を持つテキスト項目
 *
 * API の details[].path のうち、この一覧に含まれるものだけを
 * インラインエラーとして表示できる。真偽値項目（Switch）は
 * エラー表示欄を持たないため、あえて含めない。
 */
export const STORE_TEXT_FIELD_NAMES: readonly Path<StoreData>[] = [
    "store_name",
    "branch_name",
    "address",
    "business_hours",
    "regular_holidays",
    "topping_details",
    "call_details",
    "lot_detail"
]

/**
 * 送信前にテキスト項目の前後の空白を除去する
 *
 * サーバは `.trim()` サニタイザで前後の空白を落とした値を保存する。
 * 送信値を揃えておかないと、登録直後の画面の値と再取得した値がズレる。
 *
 * @param data フォームの入力値
 * @returns テキスト項目を trim 済みにした送信用データ
 */
export const trimStoreTextFields = (data: StoreData): StoreData => ({
    ...data,
    store_name: data.store_name.trim(),
    branch_name: data.branch_name?.trim(),
    address: data.address.trim(),
    business_hours: data.business_hours.trim(),
    regular_holidays: data.regular_holidays.trim(),
    topping_details: data.topping_details?.trim(),
    call_details: data.call_details?.trim(),
    lot_detail: data.lot_detail?.trim()
})
