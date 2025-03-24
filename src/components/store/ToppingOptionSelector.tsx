import { ToppingOption } from "@/src/utils/toppingFormatter"
import React from "react"
import { StyleSheet, View } from "react-native"
import { RadioButton, Text } from "react-native-paper"

interface ToppingOptionSelectorProps {
    options: ToppingOption[];
    selectedOptions: Record<string, string>
    onOptionChange: (toppingId: string, optionId: string) => void;
}

/**
 * トッピングコールオプション選択コンポーネント(precall.tsx、postcall.tsx用)
 * @param {ToppingOption[]} options トッピングコールオプション情報
 * @param {Record<string, string>} selectedOptions 選択されたトッピングコールID
 * @param {(toppingId: string, optionId: string) => void} onOptionChange 選択されたトッピングコールIDを更新するためのコールバック関数
 */
const ToppingOptionSelector: React.FC<ToppingOptionSelectorProps> = ({
    options,
    selectedOptions,
    onOptionChange
}) => {
    {/* トッピングコールオプション情報 */ }
    return (
        <>
            {options.map((toppingOption) => (
                <View key={toppingOption.toppingId} style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>
                        {toppingOption.toppingName}
                    </Text>
                    <RadioButton.Group
                        onValueChange={(value) => (
                            onOptionChange(String(toppingOption.toppingId), value))}
                        value={selectedOptions[toppingOption.toppingId] || ''}
                    >
                        <View style={styles.radioItemGrid}>
                            {toppingOption.options.map((option) => (
                                <RadioButton.Item
                                    key={option.optionId}
                                    label={option.optionName}
                                    value={String(option.optionId)}
                                    labelVariant="labelLarge"
                                />
                            ))}
                        </View>
                    </RadioButton.Group>
                </View>
            ))
            }
        </>

    )
}

const styles = StyleSheet.create({
    radioGroup: {
        marginBottom: 16
    },
    radioLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "bold"
    },
    radioItemGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,    // ネガティブマージンでグリッドの位置調整し、横スクロールを防ぐ
        paddingHorizontal: 8
    }
})

export default ToppingOptionSelector