import { VoiceTextInputProps } from "@/src/types/voice"
import { Controller, FieldValues } from "react-hook-form"
import { StyleSheet, View } from "react-native"
import { Text, TextInput, useTheme } from "react-native-paper"
import VoiceInputButton from "./VoiceInputButton"
import React from "react"

/**
 * 音声入力に対応したTextInputコンポーネント。
 *
 * `react-hook-form`の`Controller`コンポーネントをラップし、TextInputの隣に音声入力
 * ボタンを並べて表示します。マイクボタンはTextInputの外側(兄弟要素)に配置している
 * ため、通常の手入力を妨げません。音声認識結果を受け取るとフォームの値を更新し、
 * `onSpeechResult`が指定されていれば親コンポーネントにも通知します。
 *
 * @param {VoiceTextInputProps<T>} props - コンポーネントのプロパティ
 * @param {Control<T>} props.control - `react-hook-form`の`Controller`コンポーネントに渡す`Control`オブジェクト
 * @param {Path<T>} props.name - フォームのフィールド名
 * @param {string} props.label - ラベル
 * @param {boolean} [props.isRequired=false] - 必須項目かどうか
 * @param {boolean} [props.multiline=false] - 複数行入力かどうか
 * @param {number} [props.numberOfLines=1] - 複数行入力の行数
 * @param {(value: string) => void} [props.onSpeechResult] - 音声認識結果を受け取る関数
 * @returns {React.ReactElement} `react-hook-form`の`Controller`コンポーネント
 */
function VoiceTextInput<T extends FieldValues>({
    control,
    name,
    label,
    isRequired = false,
    multiline = false,
    numberOfLines = 1,
    onSpeechResult
}: VoiceTextInputProps<T>): React.ReactElement {
    const theme = useTheme()

    return (
        <Controller
            control={control}
            name={name}
            rules={isRequired ? { required: `${label}は必須項目です` } : {}}
            render={({ field, fieldState: { error } }) => (
                <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                        <TextInput
                            mode='outlined'
                            label={
                                <Text>
                                    {label} {isRequired && <Text style={{ color: theme.colors.primary }}>*</Text>}
                                </Text>
                            }
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            error={!!error}
                            multiline={multiline}
                            numberOfLines={numberOfLines}
                            style={[styles.input, multiline ? { minHeight: 120 } : null]}
                        />
                        <VoiceInputButton
                            fieldName={label}
                            size={20}
                            onSpeechResult={(text) => {
                                // フォームの値を更新
                                field.onChange(text)
                                // 親コンポーネントに通知(任意)
                                onSpeechResult?.(text)
                            }}
                        />
                    </View>
                    {error && (
                        <Text style={{ color: theme.colors.error, fontSize: 10 }}>
                            {error.message}
                        </Text>
                    )}
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    input: {
        flex: 1
    }
})

export default VoiceTextInput
