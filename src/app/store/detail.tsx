import { ScrollView } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'

/**
 * 店舗詳細画面コンポーネント
 * 
 * 登録された店舗情報の詳細表示を行う画面
 * @returns 店舗詳細表示コンポーネント
 */
export default function StoreDetails() {
    const router = useRouter()

    // 店舗データのモックアップ（実際のアプリでは状態管理またはAPIから取得する）
    const storeData = {
        store_name: "濃厚ラーメン",
        branch_name: "本店",
        address: "東京都渋谷区1-2-3",
        business_hours: "11:00 - 22:00",
        regular_holidays: "水曜日",
        prior_meal_voucher: "はい",
        topping_details: "ニンニク・野菜・アブラ・カラメ選択可",
        call_details: "トッピングコールは食券提出時に指定",
        is_all_increased: "いいえ",
        is_lot: "はい",
        lot_detail: "毎週日曜の18:00から抽選",
        // トッピングの選択状態を管理するオブジェクト
        toppings: {
            ニンニク: "マシ",
            野菜: "普通",
            アブラ: "ちょいマシ",
            カラメ: "少なめ"
        },
        noodles: "硬め"
    }

    return (
        <ScrollView style={{ padding: 20 }}>
            {/* タイトル */}
            <Text variant="titleLarge">店舗詳細</Text>

            {/* 基本情報表示セクション */}
            <Text>店舗名: {storeData.store_name}</Text>
            <Text>支店名: {storeData.branch_name}</Text>
            <Text>住所: {storeData.address}</Text>
            <Text>営業時間: {storeData.business_hours}</Text>
            <Text>定休日: {storeData.regular_holidays}</Text>

            {/* 注文システム情報セクション */}
            <Text>事前食券購入の有無: {storeData.prior_meal_voucher}</Text>
            <Text>トッピング詳細: {storeData.topping_details}</Text>
            <Text>コール詳細: {storeData.call_details}</Text>
            <Text>全体増量の有無: {storeData.is_all_increased}</Text>

            {/* 抽選情報セクション */}
            <Text>抽選制の有無: {storeData.is_lot}</Text>
            <Text>抽選詳細: {storeData.lot_detail}</Text>

            {/* トッピングコール情報を動的に表示 */}
            <Text>トッピングコール</Text>
            {Object.entries(storeData.toppings).map(([key, value], index) => (
                <Text key={index}>{key}: {value}</Text>
            ))}

            {/* 麺の硬さ設定 */}
            <Text>麺の硬さ: {storeData.noodles}</Text>

            {/* 戻るボタン - 前の画面に遷移 */}
            <Button mode="contained" onPress={() => router.back()}>戻る</Button>
        </ScrollView>
    )
}