import { FormTextInputProps } from "@/src/types/form"
import { Controller, FieldValues, Path, RegisterOptions } from "react-hook-form"
import { StyleSheet, View } from "react-native"
import { Text, TextInput, useTheme } from "react-native-paper"
import VoiceInputButton from "./VoiceInputButton"
import React from "react"
import { countChars } from "@/src/utils/textUtils"

/**
 * 店舗フォーム共通のテキスト入力コンポーネント
 *
 * `react-hook-form`の`Controller`をラップし、サーバ側のバリデーションと
 * 同じ基準で入力を検証する。
 *
 * - 必須項目は空白のみ（"   "）も弾く。`required`だけでは truthy な文字列として
 *   通ってしまい、サーバの `trim()` 後 `notEmpty()` で 400 になるため。
 * - 文字数は trim 後・コードポイント基準で数える（{@link countChars} 参照）。
 * - `enableVoiceInput`が真のとき、TextInputの外側(兄弟要素)に音声入力ボタンを
 *   並べて表示する。通常の手入力は妨げない。
 *
 * @param {FormTextInputProps<T>} props - コンポーネントのプロパティ
 * @param {Control<T>} props.control - `react-hook-form`の`Control`オブジェクト
 * @param {Path<T>} props.name - フォームのフィールド名
 * @param {string} props.label - ラベル
 * @param {boolean} [props.isRequired=false] - 必須項目かどうか
 * @param {number} [props.maxLength] - 文字数上限（未指定なら上限なし）
 * @param {boolean} [props.multiline=false] - 複数行入力かどうか
 * @param {number} [props.numberOfLines=1] - 複数行入力の行数
 * @param {boolean} [props.enableVoiceInput=false] - 音声入力ボタンを表示するか
 * @param {(value: string) => void} [props.onSpeechResult] - 音声認識結果を受け取る関数
 * @returns {React.ReactElement} `react-hook-form`の`Controller`コンポーネント
 */
function FormTextInput<T extends FieldValues>({
    control,
    name,
    label,
    isRequired = false,
    maxLength,
    multiline = false,
    numberOfLines = 1,
    enableVoiceInput = false,
    onSpeechResult
}: FormTextInputProps<T>): React.ReactElement {
    const theme = useTheme()

    const rules: Omit<
        RegisterOptions<T, Path<T>>,
        "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    > = {
        ...(isRequired ? { required: `${label}は必須項目です` } : {}),
        validate: {
            ...(isRequired
                ? {
                    notBlank: (value: unknown) =>
                        typeof value !== "string" ||
                        value.trim().length > 0 ||
                        `${label}を入力してください`
                }
                : {}),
            ...(maxLength
                ? {
                    maxLength: (value: unknown) =>
                        typeof value !== "string" ||
                        countChars(value.trim()) <= maxLength ||
                        `${label}は${maxLength}文字以内で入力してください`
                }
                : {})
        }
    }

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field, fieldState: { error } }) => {
                const currentValue = typeof field.value === "string" ? field.value : ""
                const charCount = countChars(currentValue.trim())

                return (
                    <View style={styles.inputContainer}>
                        <View style={styles.inputRow}>
                            <TextInput
                                mode='outlined'
                                label={
                                    <Text>
                                        {label} {isRequired && <Text style={{ color: theme.colors.error }}>*</Text>}
                                    </Text>
                                }
                                value={currentValue}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                error={!!error}
                                multiline={multiline}
                                numberOfLines={numberOfLines}
                                // RNのmaxLengthはUTF-16のコード単位で数えるため、上限をそのまま
                                // 渡すと絵文字がサーバより早く切られてしまう。サーバ基準の1文字は
                                // 最大3コード単位（サロゲートペア＋異体字セレクタ）なので、
                                // 4倍を暴走ペースト対策の上限とし、厳密な判定はvalidateに任せる。
                                maxLength={maxLength !== undefined ? maxLength * 4 : undefined}
                                style={[styles.input, multiline ? { minHeight: 120 } : null]}
                            />
                            {enableVoiceInput && (
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
                            )}
                        </View>
                        <View style={styles.helperRow}>
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {error?.message ?? ""}
                            </Text>
                            {maxLength !== undefined && (
                                <Text
                                    style={[
                                        styles.counterText,
                                        {
                                            color: charCount > maxLength
                                                ? theme.colors.error
                                                : theme.colors.onSurfaceVariant
                                        }
                                    ]}
                                >
                                    {charCount} / {maxLength}
                                </Text>
                            )}
                        </View>
                    </View>
                )
            }}
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
    },
    helperRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    errorText: {
        flex: 1,
        fontSize: 10
    },
    counterText: {
        fontSize: 10,
        marginLeft: 8
    }
})

export default FormTextInput
