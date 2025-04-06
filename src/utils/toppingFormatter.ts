import { BaseToppingCall } from "../types/store"
import { SimulationToppingOption } from "../types/storeApiResponse"

/**
 * フォームで選択されたトッピングコールオプションをAPI送信用に変換（店舗登録画面用）
 */
export const generateToppingCalls = (
    selectedPreCallOptions: Record<number, number[]>,
    selectedPostCallOptions: Record<number, number[]>
): BaseToppingCall[] => {
    const result: BaseToppingCall[] = []
    // console.log("selectedPreCallOptions：", selectedPreCallOptions)
    // console.log("selectedPostCallOptions", selectedPostCallOptions)
    // 選択されたオプションをループして、事前用のtopping_callsのデータを作成
    Object.entries(selectedPreCallOptions).forEach(([toppingIdStr, optionIds]) => {
        const toppingId = Number(toppingIdStr)
        optionIds.forEach(optionId => {
            // ToppingCallの配列にプッシュする
            result.push({
                topping_id: toppingId,
                call_option_id: optionId,
                call_timing: "pre_call",
                noodle_type_id: 1
            })
        })
        // console.log("事前用送信データ：", JSON.stringify(result, null, 2))
    })

    // 選択されたオプションをループして、着丼前用topping_callsのデータを作成
    Object.entries(selectedPostCallOptions).forEach(([toppingIdStr, optionIds]) => {
        const toppingId = Number(toppingIdStr)
        optionIds.forEach(optionId => {
            // ToppingCallの配列にプッシュする
            result.push({
                topping_id: toppingId,
                call_option_id: optionId,
                call_timing: "post_call",
                noodle_type_id: 1
            })
        })
        // console.log("着丼用送信データ：", JSON.stringify(result, null, 2))
    })
    return result
}

/**
 * コールテキストを生成する（precall,postcall用）
 */
export const generateCallText = (
    selectedOptions: Record<string, string>,
    toppingOptions: SimulationToppingOption[]
): string => {
    let callText = ""

    // console.log("selectedOptions：", selectedOptions)
    // console.log("toppingOptions：", toppingOptions)
    // 選択されたオプションからコール文字列を作成
    toppingOptions.forEach(option => {
        const selectedOptionId = selectedOptions[option.toppingId]
        if (!selectedOptionId) return
        // console.log("selectedOptionId：", selectedOptionId)
        const selectedOption = option.options.find((opt) => String(opt.optionId) === selectedOptionId)
        if (!selectedOption) return
        // console.log("selectedOption", selectedOption)
        if (callText) callText += `\n`

        // 麺の硬さ（ID：5）、または麺量（ID: 6）の場合は「麺〜（コールオプション名）」を設定
        if (String(option.toppingId) === "5" || String(option.toppingId) === "6") {
            callText += `麺${selectedOption.optionName}`
            // ちょいマシの場合はトッピング名のみ設定
        } else if (String(selectedOption.optionName) === "ちょいマシ") {
            callText += `${option.toppingName}`
        } else {
            callText += `${option.toppingName}${selectedOption.optionName}`
        }
    })
    return callText

}