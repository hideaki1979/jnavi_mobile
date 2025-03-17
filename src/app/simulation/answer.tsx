import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type resultScreenParams = {
    resultText?: string
}

export default function Answer() {
    const { resultText } = useLocalSearchParams<resultScreenParams>()
    const theme = useTheme()

    const handleNext = () => {
        router.push(`store/map`)
    }

    return (
        <SafeAreaView edges={[]} style={styles.container}>
            {/* ヘッダー */}
            <HeaderAppBar showBackButton={true} title="コールシミュレーション" />

            <View style={styles.screenContainer}>
                <Text style={[styles.resultText, { color: theme.colors.primary }]}>
                    {resultText ?? ''}
                </Text>
                <Text style={styles.description}>
                    二郎・二郎系店舗は退店時に{`\n`}
                    ・どんぶりをカウンターにあげる。{`\n`}
                    ・ティッシュはゴミ箱に捨てる。{`\n`}
                    ・テーブルを雑巾で拭く{`\n`}
                    というルールがあります。{`\n\n`}
                    二郎のルールはわかりましたでしょうか？{`\n`}
                    こちらのシミュレーションで慣れたら{`\n`}
                    実際に店舗で実践してみましょう！
                </Text>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.nextButton}
                >
                    次へ
                </Button>
            </View>
            {/* フッター */}
            <BottomAppBar showRoutes={["map", "create"]} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    screenContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16
    },
    resultText: {
        fontSize: 48,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 48
    },
    description: {
        lineHeight: 24,
        marginBottom: 32
    },
    nextButton: {
        width: "50%"
    }
})