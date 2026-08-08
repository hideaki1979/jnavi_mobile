import { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { ApiError } from "../api/Apiclient"

/**
 * 例外をそのまま画面に出せるメッセージへ変換する
 *
 * API のエラーは出所によって `details` の有無が変わるため、
 * details があればフィールド単位のメッセージを、無ければ本文を表示する。
 *
 * @param error catch した例外
 * @param fallback Error ですらない値だった場合に表示する文言
 * @returns 画面表示用のメッセージ
 */
export const toDisplayMessage = (error: unknown, fallback: string): string => {
    if (error instanceof ApiError) return error.displayMessage
    if (error instanceof Error) return error.message
    return fallback
}

/**
 * API のバリデーションエラーをフォームのインラインエラーへ反映する
 *
 * details[].path がフォームの入力項目と一致するものはインライン表示に回し、
 * 一致しないもの（topping_calls.0.topping_id など画面に入力欄が無い項目）は
 * 表示されないまま握り潰されないよう、まとめて戻り値のメッセージへ含める。
 *
 * @param error catch した例外
 * @param setError react-hook-form の setError
 * @param formFieldNames フォームが持つ入力項目名
 * @param fallback Error ですらない値だった場合に表示する文言
 * @returns スナックバー等に表示すべきメッセージ
 */
export const applyApiFieldErrors = <T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    formFieldNames: readonly Path<T>[],
    fallback: string
): string => {
    if (!(error instanceof ApiError) || !error.hasFieldErrors) {
        return toDisplayMessage(error, fallback)
    }

    // 1項目に対して複数の details が返ることがあるため、項目ごとに集約してから
    // まとめて設定する（項目ごとに setError すると最後の1件しか残らない）。
    // 同じ文言が重複することもあるので取り除く。
    //   例) store_name に "" を送ると trim 前後の notEmpty() 双方で弾かれ
    //       「店舗名は必須です」が2件、null なら型チェックも加わり3件返る
    const fieldMessages = new Map<Path<T>, string[]>()
    const unmappedMessages: string[] = []

    error.details?.forEach((detail) => {
        const path = detail.path as Path<T>

        if (formFieldNames.includes(path)) {
            const messages = fieldMessages.get(path) ?? []
            if (!messages.includes(detail.msg)) {
                fieldMessages.set(path, [...messages, detail.msg])
            }
            return
        }

        if (!unmappedMessages.includes(detail.msg)) {
            unmappedMessages.push(detail.msg)
        }
    })

    fieldMessages.forEach((messages, path) => {
        setError(path, { type: "server", message: messages.join("\n") })
    })

    return unmappedMessages.length > 0
        ? unmappedMessages.join("\n")
        : "入力内容にエラーがあります。各項目のメッセージを確認してください。"
}
