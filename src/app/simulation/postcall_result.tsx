import { useLocalSearchParams } from "expo-router"
import CallResultScreen from "@/src/components/store/CallResultScreen"

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

    return (
        <CallResultScreen
            callText={callText}
            nextRoute="simulation/afterfinish"
        />
    )
}