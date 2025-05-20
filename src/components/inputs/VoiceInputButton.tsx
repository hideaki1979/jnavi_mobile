import { VoiceInputButtonProps } from "@/src/types/voice"
import { useEffect, useState } from "react"
import { IconButton, Text, useTheme } from "react-native-paper"
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice'
import { StyleSheet, View } from "react-native"

/**
 * 音声入力ボタン
 * 
 * `VoiceInputButton`コンポーネントは、音声入力を開始/停止するボタンを提供します。
 * ボタンを押すと、音声入力が開始/停止されます。
 * 音声入力が開始された場合は、`onSpeechResults`で指定された関数に音声認識結果が
 * 渡されます。
 * 
 * @param {VoiceInputButtonProps} props - コンポーネントのプロパティ
 * @param {string} props.fieldName - ボタンのラベルに使用するフィールド名
 * @param {string} [props.size=24] - ボタンのサイズ
 * @param {(value: string) => void} props.onSpeechResult - 音声認識結果を受け取る関数
 */
const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
    onSpeechResult,
    fieldName,
    size = 24
}) => {
    const [isListening, setIsListening] = useState(false)
    const theme = useTheme()

    useEffect(() => {
        // イベントリスナーの設定
        Voice.onSpeechStart = () => setIsListening(true)
        Voice.onSpeechEnd = () => setIsListening(false)
        Voice.onSpeechError = (error) => {
            console.error('音声認識エラー：', error)
            setIsListening(false)

        }
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                onSpeechResult(e.value[0])
                setIsListening(false)
            }
        }

        // クリーンアップ
        return () => {
            Voice.destroy().then(Voice.removeAllListeners)
        }
    }, [onSpeechResult])

    const toggleVoiceRecognition = async () => {
        try {
            if (isListening) {
                await Voice.stop()
            } else {
                await Voice.start('ja-JP')
            }
        } catch (error) {
            console.error('音声認識エラー：', error)
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