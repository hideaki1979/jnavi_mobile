import { Control, FieldValues, Path } from "react-hook-form"

export interface VoiceInputButtonProps {
    onSpeechResult: (text: string) => void;
    fieldName: string;
    size?: number;
}

export interface VoiceTextInputProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    isRequired?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    onSpeechResult?: (text: string) => void;
}