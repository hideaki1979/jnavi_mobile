import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"
import { Appbar, Button, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

type callScreenParams = {
    callText?: string
}

export default function PostCallResult() {
    const { callText } = useLocalSearchParams<callScreenParams>()

    const handleNext = () => {
        router.push(`simulation/afterfinish`)
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
                <Appbar.Action
                    icon="play-circle"
                    size={32}
                    onPress={() => { }}
                />
            </Appbar.Header>
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
    screenText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 32,
        marginBottom: 48
    },
    nextButton: {
        width: "50%"
    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})