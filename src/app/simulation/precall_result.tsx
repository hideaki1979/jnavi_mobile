import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { Platform, StyleSheet, View } from "react-native"
import { Button, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Speech from 'expo-speech'

type callScreenParams = {
    callText: string;
    id: string;
}

export default function PreCallResult() {
    const { callText, id } = useLocalSearchParams<callScreenParams>()
    const theme = useTheme()
    const [isSpeaking, setIsSpeaking] = useState(false)

    const handleNext = () => {
        router.push({
            pathname: `simulation/postcall`,
            params: { id }
        })
    }

    const handleSpeech = () => {
        // 再生中の場合は停止にする。
        if (isSpeaking) {
            Speech.stop()
            setIsSpeaking(false)
            return
        }

        setIsSpeaking(true)

        // iOSの改行問題に対応
        if (Platform.OS === 'ios') {
            // テキストを改行で分割
            const textSegments =
                (callText || '').split('\n').filter(segment => segment.trim() !== '')

            // 各セグメントを順番に読み上げる
            let currentIndex = 0

            const options = {
                language: "ja-JP",
                pitch: 1.0,
                rate: 0.8,
                /**
                 * 読み上げ完了時に呼び出される。
                 *  1. 現在のインデックスをインクリメント
                 *  2. 残りのセグメントがある場合は次のセグメントを0.3秒待機して読み上げる
                 *  3. 残りのセグメントがなければisSpeakingをfalseにする
                 */
                onDone: () => {
                    currentIndex++
                    if (currentIndex < textSegments.length) {
                        // 次のセグメントを読み上げる
                        setTimeout(() => {
                            Speech.speak(textSegments[currentIndex], options)
                        }, 300) // 0.3秒待機して次のセグメントを読み上げる
                    } else {
                        setIsSpeaking(false)
                    }
                },
                onError: () => setIsSpeaking(false)
            }

            // 最初のセグメントから読み始める
            if (textSegments.length > 0) {
                Speech.speak(textSegments[0], options)
            } else {
                setIsSpeaking(false)
            }
        } else {
            const options = {
                language: "ja-JP",
                pitch: 1.0,
                rate: 1.0,
                onDone: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false)
            }
            Speech.speak(callText || '', options)
        }
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
                    onPress: handleSpeech
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