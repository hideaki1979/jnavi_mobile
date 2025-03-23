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
    callText: string
}

/**
 * コールシミュレーションの結果画面コンポーネント。
 * 
 * コールシミュレーションの結果を表示し、次の画面に遷移するボタンを提供します。
 * また、音声合成機能を提供します。
 * 
 * @param {callScreenParams} なし
 * @return {JSX.Element} コールシミュレーションの結果画面コンポーネント
 */
export default function PostCallResult() {
    const { callText } = useLocalSearchParams<callScreenParams>()
    const theme = useTheme()
    const [isSpeaking, setIsSpeaking] = useState(false)


    /**
     * 次の画面に遷移する関数。
     * 
     * この関数は、`simulation/afterfinish` というルートに画面遷移を行います。
     */
    const handleNext = () => {
        router.push(`simulation/afterfinish`)
    }

    /**
     * テキストを音声合成する関数。
     * 
     * iOSの場合は、改行文字列を区切りにして、各区切りのテキストを順番に読み上げます。
     * Androidの場合は、改行文字列を区切りにせず、もとのテキストをまるっと読み上げます。
     * 
     * 読み上げが完了すると、`isSpeaking` を `false` にします。
     * 読み上げエラーが発生すると、`isSpeaking` を `false` にします。
     * 
     * @param {void} なし
     * @return {void} なし
     */
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
    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})