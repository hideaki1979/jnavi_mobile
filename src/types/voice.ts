import { FieldValues } from "react-hook-form"
import { FormTextInputProps } from "./form"

export interface VoiceInputButtonProps {
    onSpeechResult: (text: string) => void;
    fieldName: string;
    size?: number;
}

/**
 * VoiceTextInput は音声入力を有効にした FormTextInput のため、
 * enableVoiceInput 以外のプロパティをそのまま受け取る。
 */
export type VoiceTextInputProps<T extends FieldValues> = Omit<
    FormTextInputProps<T>,
    "enableVoiceInput"
>
