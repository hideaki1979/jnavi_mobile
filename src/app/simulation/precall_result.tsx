import { useLocalSearchParams } from "expo-router"
import CallResultScreen from "@/src/components/store/CallResultScreen"

type callScreenParams = {
    callText: string;
    id: string;
}

/**
 * コールシミュレーションの事前コール結果画面。
 * 
 * 選択されたトッピングコールオプションの結果を表示し、「次へ」ボタンを提供します。
 * 「次へ」ボタンを押すと、着丼前コール画面に遷移します。
 * 
 * @param {callScreenParams} なし
 * @return {JSX.Element} コールシミュレーションの事前コール結果画面
 */
export default function PreCallResult() {
    const { callText, id } = useLocalSearchParams<callScreenParams>()

    return (
        <CallResultScreen
            callText={callText}
            nextRoute={"simulation/postcall"}
            nextParams={{ id }}
        />
    )
}