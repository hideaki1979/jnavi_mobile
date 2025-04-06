import { getToppingCallOptions } from "@/src/api/toppingApi"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { useEffect } from "react"
import { View } from "react-native"
import { Text } from "react-native-paper"


export default function Home() {
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const result = await getToppingCallOptions()

                console.log("トッピング・コールオプション整形データ：",
                    JSON.stringify(result, null, 2))
            } catch (error) {
                console.error("トッピングコール情報取得エラー：", error)
            }
        }
        fetchTest()
    }, [])


    return (
        <>
            <HeaderAppBar
                title="Home（テスト用）"
                showBackButton={true}
            />
            <View>
                <Text>Home（まだテスト用です！）</Text>
            </View>
        </>
    )
}