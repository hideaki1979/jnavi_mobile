import { Control, FieldValues, Path } from "react-hook-form"

export interface FormTextInputProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    isRequired?: boolean;
    /** サーバと同じ基準（コードポイント数）で判定する文字数上限 */
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
    /** 音声入力ボタンを表示するか */
    enableVoiceInput?: boolean;
    onSpeechResult?: (value: string) => void;
}
