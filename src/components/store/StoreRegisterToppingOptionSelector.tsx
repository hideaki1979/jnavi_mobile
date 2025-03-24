import { CallOptionData, ToppingData } from "@/src/types/topping"
import React from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Checkbox, Text } from "react-native-paper"

interface StoreRegisterToppingOptionSelectorProps {
    toppings: ToppingData[];
    toppingCategoryOptionsMap: Record<number, CallOptionData[]>;
    selectedOptions: Record<number, number[]>;
    onOptionChange: (toppingId: number, optionId: number, isChecked: boolean) => void;
    callType: 'pre_call' | 'post_call';
}

/**
 * トッピングオプション選択コンポーネント (店舗登録用)
 * 
 * トッピングの種類ごとにコールオプションをチェックボックスで選択できるコンポーネント
 */
const StoreRegisterToppingOptionSelector: React.FC<StoreRegisterToppingOptionSelectorProps> = ({
    toppings,
    toppingCategoryOptionsMap,
    selectedOptions,
    onOptionChange,
    callType
}) => {
    return (
        <>
            {toppings.map(topping => {
                // トッピングカテゴリーに対応するコールオプションを取得
                const toppingCallOptions = toppingCategoryOptionsMap[topping.topping_category] || []
                return (
                    <View key={`${callType}-${topping.id}`} style={styles.optionContainer}>
                        <Text style={styles.optionLabel}>{topping.topping_name}</Text>
                        <View style={styles.optionGrid}>
                            {toppingCallOptions.map((option) => (
                                <View key={option.id} style={styles.checkboxContainer}>
                                    <Checkbox.Item
                                        label={option.call_option_name}
                                        status={selectedOptions[topping.id].includes(option.id) ? "checked" : "unchecked"}
                                        onPress={() => onOptionChange(
                                            topping.id,
                                            option.id,
                                            !selectedOptions[topping.id]?.includes(option.id)
                                        )}
                                        style={styles.checkboxItem}
                                        labelStyle={styles.checkboxLabel}
                                        mode={Platform.OS === "ios" ? "ios" : "android"}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )
            })}
        </>
    )
}

const styles = StyleSheet.create({
    optionContainer: {
        marginBottom: 16
    },
    optionLabel: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "bold"
    },
    optionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8    // ネガティブマージンでグリッドの位置調整し、横スクロールを防ぐ
    },
    checkboxContainer: {
        width: "50%",   // 2列に並べる
        paddingHorizontal: 8
    },
    checkboxItem: {
        padding: 8
    },
    checkboxLabel: {
        fontSize: 14
    }
})

export default StoreRegisterToppingOptionSelector