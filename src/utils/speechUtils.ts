import * as Speech from 'expo-speech'
import { Platform } from 'react-native'

/**
 * テキストを音声合成する関数。
 *
 * iOSの場合は、改行文字列を区切りにして、各区切りのテキストを順番に読み上げます。
 * Androidの場合は、改行文字列を区切りにせず、もとのテキストをまるっと読み上げます。
 *
 * 読み上げが完了すると、`isSpeaking` を `false` にします。
 * 読み上げエラーが発生すると、`isSpeaking` を `false` にします。
 *
 * @param {string} text - 読み上げるテキスト
 * @param {boolean} isSpeaking - 読み上げ中かどうか
 * @param {(value: boolean) => void} setIsSpeaking - 読み上げ中かどうかを設定する
 * @returns {void}
 */
export const handleSpeech = (
    text: string,
    isSpeaking: boolean,
    setIsSpeaking: (value: boolean) => void
): void => {
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
            (text || '').split('\n').filter(segment => segment.trim() !== '')

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
        Speech.speak(text || '', options)
    }
}
