import { VoiceInputButtonProps } from "@/src/types/voice"
import { useRef, useState } from "react"
import { IconButton, Text, useTheme } from "react-native-paper"
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition"
import { StyleSheet, View } from "react-native"

/**
 * 音声入力ボタン
 *
 * `VoiceInputButton`コンポーネントは、音声入力(音声→テキスト)を開始/停止する
 * ボタンを提供します。ボタンを押すとマイク・音声認識の権限を要求し、許可されると
 * 音声認識を開始します。確定した認識結果は`onSpeechResult`に渡されます。
 *
 * `expo-speech-recognition`のイベント(`useSpeechRecognitionEvent`)はアプリ全体で
 * 共有されるため、複数の`VoiceInputButton`が同時にマウントされていても、認識を
 * 開始したボタンだけが結果を処理するよう`isActiveRef`でガードしている。
 *
 * @param {VoiceInputButtonProps} props - コンポーネントのプロパティ
 * @param {string} props.fieldName - ボタンのラベル(アクセシビリティ)に使用するフィールド名
 * @param {number} [props.size=24] - ボタンのサイズ
 * @param {(value: string) => void} props.onSpeechResult - 確定した音声認識結果を受け取る関数
 */
const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
    onSpeechResult,
    fieldName,
    size = 24
}) => {
    const [isListening, setIsListening] = useState(false)
    // このボタンが認識を開始した場合のみ true。共有イベントの取り違えを防ぐ。
    const isActiveRef = useRef(false)
    const theme = useTheme()

    useSpeechRecognitionEvent("start", () => {
        if (!isActiveRef.current) return
        setIsListening(true)
    })

    useSpeechRecognitionEvent("end", () => {
        if (!isActiveRef.current) return
        isActiveRef.current = false
        setIsListening(false)
    })

    useSpeechRecognitionEvent("result", (event) => {
        if (!isActiveRef.current) return
        const transcript = event.results[0]?.transcript
        if (event.isFinal && transcript) {
            onSpeechResult(transcript)
        }
    })

    useSpeechRecognitionEvent("error", (event) => {
        if (!isActiveRef.current) return
        // no-speech / audio-capture 等は復帰可能な想定内エラー。dev の赤い
        // LogBox オーバーレイを出さないよう error ではなく warn で記録する。
        console.warn("音声認識エラー：", event.error, event.message)
        isActiveRef.current = false
        setIsListening(false)
    })

    const toggleVoiceRecognition = async () => {
        if (isListening) {
            ExpoSpeechRecognitionModule.stop()
            return
        }
        try {
            const permission =
                await ExpoSpeechRecognitionModule.requestPermissionsAsync()
            if (!permission.granted) {
                console.warn("音声認識の権限が許可されませんでした")
                return
            }
            isActiveRef.current = true
            ExpoSpeechRecognitionModule.start({
                lang: "ja-JP",
                interimResults: false,
                continuous: false
            })
        } catch (error) {
            isActiveRef.current = false
            console.error("音声認識エラー：", error)
        }
    }

    return (
        <View style={styles.container}>
            <IconButton
                icon={isListening ? 'microphone' : 'microphone-outline'}
                mode={isListening ? 'contained' : 'outlined'}
                size={size}
                iconColor={isListening ? theme.colors.onPrimary : theme.colors.primary}
                containerColor={isListening ? theme.colors.primary : 'transparent'}
                onPress={toggleVoiceRecognition}
                accessibilityLabel={`${fieldName}の音声入力${isListening ? '停止' : '開始'}`}
            />
            {isListening && (
                <Text style={[styles.listeningText, { color: theme.colors.primary }]}>
                    聞き取り中...
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    listeningText: {
        marginLeft: 8,
        fontSize: 12
    }
})

export default VoiceInputButton
