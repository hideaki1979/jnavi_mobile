import { router } from "expo-router"
import { useState } from "react"
import { Appbar, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import * as ExpoSpeech from "expo-speech"

const text: string = "こんにちは！\nお元気ですか？\n私は元気です"
export default function Speech() {

    const [isSpeaking, setIsSpeaking] = useState<boolean>(false)

    /**
     * テキストを音声合成する関数
     * isSpeaking状態がtrueの場合は音声合成を停止する
     * isSpeaking状態がfalseの場合は音声合成を開始する
     * 
     * @remarks
     * ExpoSpeech.speak()で音声合成を実行し、完了した場合はisSpeakingをfalseに戻す
     * エラーが発生した場合はisSpeakingをfalseに戻す
     */
    const handleSpeech = () => {
        if (isSpeaking) {
            ExpoSpeech.stop()
            setIsSpeaking(false)
            return
        }

        setIsSpeaking(true)

        const options = {
            language: 'ja',
            pitch: 1.0,
            rate: 1.0,
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false)
        }
        ExpoSpeech.speak(text, options)

    }

    return (
        <SafeAreaView edges={[]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Action
                    icon={isSpeaking ? "pause-circle" : "play-circle"}
                    size={32}
                    onPress={handleSpeech}
                />
            </Appbar.Header>
            <Text>{text}</Text>
        </SafeAreaView>
    )
}