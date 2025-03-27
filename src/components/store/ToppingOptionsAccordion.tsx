import { FormattedOptions } from "@/src/utils/toppingFormatter"
import React from "react"
import { StyleSheet, View } from "react-native"
import { Chip, List, Text } from "react-native-paper"

interface ToppingOptionsAccordionProps {
    title: string;
    expanded: boolean;
    onPress: () => void;
    options: FormattedOptions;
    leftIcon: React.ReactNode;

}

/**
 * トッピングオプションを表示するアコーディオンコンポーネント(店舗詳細画面用)
 */
const ToppingOptionsAccordion: React.FC<ToppingOptionsAccordionProps> = ({
    title,
    expanded,
    onPress,
    options,
    leftIcon
}) => {
    {/* ニンニク、野菜、アブラ、カラメなどのコールオプション表示 */ }
    return (
        <List.Accordion
            title={title}
            expanded={expanded}
            onPress={onPress}
            left={props => leftIcon || <List.Icon {...props} icon="clipboard-outline" />}
            style={styles.accordionContainer}
            titleStyle={styles.accordionTitle}
        >
            <View style={styles.accordionContent}>
                {Object.entries(options).map(([toppingName, options]: [string, string[]]) => (
                    <View key={toppingName} style={styles.toppingCategory}>
                        <Text style={styles.toppingLabel}>
                            {toppingName}：
                        </Text>
                        <View style={styles.chipContainer}>
                            {options.map((option: string, index: number) => (
                                <Chip
                                    key={index}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                    mode='outlined'>
                                    {option}
                                </Chip>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </List.Accordion>
    )
}

const styles = StyleSheet.create({
    accordionContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    accordionTitle: {
        fontWeight: "bold"
    },
    accordionContent: {
        paddingVertical: 16
    },
    toppingCategory: {
        marginBottom: 8
    },
    toppingLabel: {
        fontWeight: "bold"
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    chip: {
        margin: 8
    },
    chipText: {
        fontSize: 10
    }
})

export default ToppingOptionsAccordion