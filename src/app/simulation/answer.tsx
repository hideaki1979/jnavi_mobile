import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"
import { Appbar, Button, Text, useTheme } from "react-native-paper"
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
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content
                    title="コールシミュレーション"
                    titleStyle={{ fontSize: 16, fontWeight: "bold" }}
                />
            </Appbar.Header>
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
            <Appbar style={styles.bottomBar}>
                <Appbar.Action icon="map" onPress={() => { router.push(`store/map`) }} />
                <Appbar.Action icon="home" onPress={() => { }} />
                <Appbar.Action icon="plus-box"
                    onPress={() => { router.push(`store/create`) }} />
                <Appbar.Action
                    icon="tune-vertical"
                    onPress={() => { router.push(`simulation/ticket_machine`) }} />
                <Appbar.Action icon="account" onPress={() => { }} />
            </Appbar>
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
    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})