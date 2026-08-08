import { VoiceTextInputProps } from "@/src/types/voice"
import { FieldValues } from "react-hook-form"
import React from "react"
import FormTextInput from "./FormTextInput"

/**
 * 音声入力に対応したTextInputコンポーネント。
 *
 * 検証・文字数カウント・エラー表示は{@link FormTextInput}と共通で、
 * 本コンポーネントは音声入力ボタンを有効にした薄いラッパー。
 *
 * @param {VoiceTextInputProps<T>} props - コンポーネントのプロパティ
 * @returns {React.ReactElement} 音声入力ボタン付きのFormTextInput
 */
function VoiceTextInput<T extends FieldValues>(
    props: VoiceTextInputProps<T>
): React.ReactElement {
    return <FormTextInput {...props} enableVoiceInput={true} />
}

export default VoiceTextInput
