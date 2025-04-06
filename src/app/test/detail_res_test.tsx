import { getStoreById } from "@/src/api/storeApi"
import { useEffect } from "react"
import { Text } from "react-native-paper"


export default function DetailResTest() {
    useEffect(() => {
        const fetchStoreData = async () => {
            // 店舗情報取得
            const res = await getStoreById("17")
            console.log("店舗情報：", JSON.stringify(res, null, 2))

            console.log("preCallFormatted：", JSON.stringify(res.preCallFormatted, null, 2))
            console.log("postCallFormatted：", JSON.stringify(res.postCallFormatted, null, 2))
        }

        fetchStoreData()
    }, [])

    return (
        <>
            <Text>DetailResTest</Text>
        </>
    )
}