import { SimulationToppingOption } from "@/src/types/storeApiResponse"
import { SelectedToppingInfo } from "@/src/types/storeImage"
import { StyleSheet, View } from "react-native"
import { RadioButton, Text } from "react-native-paper"


interface ImageUploadToppingSelectorProps {
    options: SimulationToppingOption[];
    selectedOptions: Record<string, SelectedToppingInfo>;
    onOptionChange: (toppingId: string, optionId: string, storeToppingCallId?: string) => void;
}

/**
 * 画像アップロード用トッピングコールオプション選択コンポーネント
 * store_topping_call_idを含めて処理するための特殊版
 */
const ImageUploadToppingSelector: React.FC<ImageUploadToppingSelectorProps> = ({
    options,
    selectedOptions,
    onOptionChange
}) => {
    return (
        <>
            {options.map((toppingOption) => (
                <View key={toppingOption.toppingId} style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>{toppingOption.toppingName}</Text>
                    <RadioButton.Group
                        onValueChange={(value) => {
                            // 選択されたオプションを探す
                            const selectedOption = toppingOption.options.find(
                                (opt) => String(opt.optionId) === value
                            )
                            // オプションとstore_topping_call_idを渡す
                            onOptionChange(
                                String(toppingOption.toppingId),
                                value,
                                String(selectedOption?.storeToppingCallId)
                            )
                        }}
                        value={selectedOptions[toppingOption.toppingId]
                            ? String(selectedOptions[toppingOption.toppingId].optionId)
                            : ""}
                    >
                        <View style={styles.radioItemGrid}>
                            {toppingOption.options.map((option, index) => (
                                <RadioButton.Item
                                    key={`${option.optionId}-${index}`}
                                    label={option.optionName}
                                    value={String(option.optionId)}
                                    labelVariant="labelLarge"
                                />
                            ))}
                        </View>
                    </RadioButton.Group>
                </View>
            ))}
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
        marginHorizontal: -8,
        paddingHorizontal: 8
    }
})

export default ImageUploadToppingSelector