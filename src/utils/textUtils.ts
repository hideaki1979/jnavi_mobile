// 異体字セレクタ（U+FE0F/U+FE0E）を伴う文字。直前の1文字とセットで1文字と数える
const PRESENTATION_SEQUENCE = /[^\uFE0F\uFE0E][\uFE0F\uFE0E]/g
// サロゲートペア（絵文字など BMP 外の文字）。2コード単位で1文字と数える
const SURROGATE_PAIR = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g

/**
 * サーバと同じ数え方で文字数を返す
 *
 * サーバは express-validator（validator.js）の isLength で長さを判定しており、
 * その実装は「UTF-16 のコード単位数から、異体字セレクタとサロゲートペアの
 * 余剰分を差し引く」というもの。ここでは同じ計算を再現している。
 *
 * String#length をそのまま使うと絵文字を2文字と数えてサーバより厳しくなり、
 * 実際には通る入力を弾いてしまう。逆に [...value].length（コードポイント数）は
 * 異体字セレクタを1文字余分に数えるため、"❤️" のような文字でやはりズレる。
 *
 * @param value 数える文字列
 * @returns サーバ基準の文字数
 */
export const countChars = (value: string): number => {
    const presentationSequences = value.match(PRESENTATION_SEQUENCE)?.length ?? 0
    const surrogatePairs = value.match(SURROGATE_PAIR)?.length ?? 0
    return value.length - presentationSequences - surrogatePairs
}
