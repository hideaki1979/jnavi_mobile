import { BaseToppingCall } from "../types/store"
import { SimulationSelectToppingCallsData, StoreToppingCall } from "../types/storeApiResponse"
import { CallOptionData, ToppingData } from "../types/topping"

/**
 * トッピングとコールオプションの組み合わせを表す型
 */
export interface ToppingOption {
    toppingId: string | number;
    toppingName: string;
    options: {
        optionId: string | number;
        optionName: string;
        store_topping_call_id?: string;
    }[];
}

/**
 * 整形されたトッピングオプションの型定義(precall,postcall用)
 */
export interface FormattedOptions {
    [toppingName: string]: string[]; // トッピング名をキーにして、対応するコールオプション名の配列を格納
}

/**
* APIから取得した店舗トッピングコールデータを画面表示用に整形する
* （precall,postcall,image_upload用）
*/
export const formatToppingOptions = (
    storeToppingCalls: SimulationSelectToppingCallsData['store_topping_calls'],
    toppings: ToppingData[],
    callOptions: CallOptionData[],
    callTiming: 'pre_call' | 'post_call' | 'all',
    includeStoreToppingCallId: boolean = false
): ToppingOption[] => {

    // トッピングIDごとの一時データ保持用オブジェクト
    const optionMap: Record<string, ToppingOption> = {}
    // console.log("storeToppingCalls：", storeToppingCalls)

    // 各トッピングコールをループ処理
    storeToppingCalls?.forEach((call) => {
        // callTimingが'all'の場合はすべて含める、それ以外は指定されたタイミングのみ
        if (callTiming !== 'all' && call.call_timing !== callTiming) return

        // console.log("call：", call)
        const topping = toppings.find(t => String(t.id) === call.topping_id)
        const callOption = callOptions.find(co => String(co.id) === call.call_option_id)

        if (!topping || !callOption) return

        // マップに存在しない場合は初期化
        if (!optionMap[topping.id]) {
            optionMap[topping.id] = {
                toppingId: topping.id,
                toppingName: topping.topping_name,
                options: []
            }
        }

        // オプションを追加
        optionMap[topping.id].options.push({
            optionId: String(callOption.id),
            optionName: callOption.call_option_name,
            ...(includeStoreToppingCallId && call.id ? { store_topping_call_id: String(call.id) } : {})
        })
        // console.log("optionMap：", JSON.stringify(optionMap, null, 2))
    })

    // console.log("optionMap最終結果：", JSON.stringify(Object.values(optionMap), null, 2))
    // オブジェクトから配列に変換して返す
    return Object.values(optionMap)
}

/**
 * 画面表示用にトッピング名とオプション名のマッピングを作成する（店舗詳細画面）
 */
export const createFormattedOptions = (
    storeToppingCalls: BaseToppingCall[] | StoreToppingCall[],
    toppings: ToppingData[],
    callOptions: CallOptionData[]
): { preCallFormatted: FormattedOptions, postCallFormatted: FormattedOptions } => {

    // トッピング用のオブジェクト初期化
    const formattedPre: FormattedOptions = {}
    const formattedPost: FormattedOptions = {}
    // 店舗別トッピングコールがない場合は、整形無しでリターン
    if (!storeToppingCalls) return { preCallFormatted: formattedPre, postCallFormatted: formattedPost }

    // console.log("storeToppingCalls：", JSON.stringify(storeToppingCalls, null, 2))
    // 各トッピングコールの配列に格納する
    storeToppingCalls.forEach(call => {
        // トッピングとコールオプションを取得
        const topping = toppings.find(t => t.id === call.topping_id)
        const callOption = callOptions.find(t => t.id === call.call_option_id)

        // console.log("トッピング配列情報：", topping)
        // console.log("コールオプション配列情報：", callOption)

        if (!topping || !callOption) return

        // 事前コールトッピング整形
        if (call.call_timing === 'pre_call') {
            if (!formattedPre[topping.topping_name]) {
                formattedPre[topping.topping_name] = []
            }
            formattedPre[topping.topping_name].push(callOption.call_option_name)
            // console.log("formattedPre：", JSON.stringify(formattedPre, null, 2))
            // 着丼前コールトッピング整形
        } else {
            if (!formattedPost[topping.topping_name]) {
                formattedPost[topping.topping_name] = []
            }
            formattedPost[topping.topping_name].push(callOption.call_option_name)
            // console.log("formattedPost：", JSON.stringify(formattedPost, null, 2))
        }
    })
    return { preCallFormatted: formattedPre, postCallFormatted: formattedPost }
}

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
    toppingOptions: ToppingOption[]
): string => {
    let callText = ""

    // console.log("selectedOptions：", selectedOptions)
    // console.log("toppingOptions：", toppingOptions)
    // 選択されたオプションからコール文字列を作成
    toppingOptions.forEach(option => {
        const selectedOptionId = selectedOptions[option.toppingId]
        if (!selectedOptionId) return
        // console.log("selectedOptionId：", selectedOptionId)
        const selectedOption = option.options.find(opt => String(opt.optionId) === selectedOptionId)
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