import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type callScreenParams = {
    callText: string
}

export default function PreCallResult() {
    const { callText } = useLocalSearchParams<callScreenParams>()
    const theme = useTheme()

    const handleNext = () => {
        router.push(`simulation/postcall`)
    }

    return (
        <SafeAreaView edges={[]} style={styles.container}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* ヘッダー */}
            <HeaderAppBar
                showBackButton={true}
                title="コールシミュレーション"
                rightAction={{
                    icon: "play-circle",
                    size: 32,
                    onPress: () => { }
                }}
            />

            <View style={styles.screenContainer}>
                <Text style={styles.screenText}>
                    {callText ?? ''}
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
    screenText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 32,
        marginBottom: 48
    },
    nextButton: {
        width: "50%"
    }
})