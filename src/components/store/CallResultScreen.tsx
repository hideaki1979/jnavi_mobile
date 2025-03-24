import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import HeaderAppBar from "../navigation/HeaderAppBar"
import { handleSpeech } from "@/src/utils/speechUtils"
import { StyleSheet, View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import BottomAppBar from "../navigation/BottomAppBar"

interface CallResultScreenProps {
    callText: string;
    nextRoute: string;
    nextParams?: Record<string, string>;
}

/**
 * コール結果画面を表示するコンポーネント。
 * 
 * 与えられたテキストを表示し、音声合成機能を提供します。また、次の画面に遷移するボタンを提供します。
 * 
 * @param {CallResultScreenProps} props - コンポーネントのプロパティ。
 * @param {string} props.callText - 表示されるテキスト。
 * @param {string} props.nextRoute - 次の画面へのルート。
 * @param {Record<string, string>} [props.nextParams] - 次の画面へのルートパラメータ。
 * 
 * @returns {JSX.Element} コール結果画面コンポーネント。
 */
const CallResultScreen: React.FC<CallResultScreenProps> = ({
    callText,
    nextRoute,
    nextParams = {}
}) => {
    const theme = useTheme()
    const [isSpeaking, setIsSpeaking] = useState(false)

    const handleNext = () => {
        router.push({
            pathname: nextRoute,
            params: nextParams
        })
    }

    return (
        <SafeAreaView edges={[]} style={styles.container}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* ヘッダー */}
            <HeaderAppBar
                showBackButton={true}
                title="コールシミュレーション"
                rightAction={{
                    icon: isSpeaking ? "pause-circle" : "play-circle",
                    size: 32,
                    onPress: () => handleSpeech(callText, isSpeaking, setIsSpeaking)
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

export default CallResultScreen