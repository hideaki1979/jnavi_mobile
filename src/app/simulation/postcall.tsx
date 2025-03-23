import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, RadioButton, Snackbar, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import postCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { getStoreToppingCalls } from "@/src/api/storeApi"
import { SimulationSelectToppingCallsData } from "@/src/types/storeApiResponse"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import { CallOptionData, ToppingData } from "@/src/types/topping"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { StatusBar } from "expo-status-bar"


interface PostCallOptions {
    toppingId: string | number;
    toppingName: string;
    options: {
        optionId: string | number;
        optionName: string;
    }[];
}

export default function PostCall() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const theme = useTheme()
    const postCallImage = Asset.fromModule(postCallImageSource)

    // エラー、ローディングを管理
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)

    // 店舗別コールトッピング情報、ユーザーのラジオ選択状態を管理
    const [postcallOptions, setPostcallOptions] = useState<PostCallOptions[]>([])
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    // APIからコールトッピング情報を取得
    useEffect(() => {
        const fetchStoreCallToppingData = async () => {
            try {
                // 店舗情報・トッピングコール情報を並列で取得する。(IDは暫定で固定)
                const [storeRes, toppingRes, callOptionRes] = await Promise.all([
                    getStoreToppingCalls(id, "post_call"),
                    getToppings(),
                    getCallOptions()
                ])

                // データがない場合は早期リターン
                if (!storeRes.store_topping_calls || storeRes.store_topping_calls.length === 0) {
                    setLoading(false)
                    return
                }

                // トッピングデータがある場合は整形する
                // 例：[{"toppingId":3,"toppingName":"アブラ","options":[{"optionId":"4","optionName":"抜き"},{"optionId":"5","optionName":"少なめ"}]},{"toppingId":4,"toppingName":"カラメ","options":[{"optionId":"4","optionName":"抜き"},{"optionId":"5","optionName":"少なめ"}]},{"toppingId":5,"toppingName":"麺の硬さ","options":[{"optionId":"2","optionName":"硬め"},{"optionId":"3","optionName":"カタカタ"}]},{"toppingId":6,"toppingName":"麺量","options":[{"optionId":"9","optionName":"半分"},{"optionId":"10","optionName":"少なめ"}]}]
                const formattedOptions = formatToppingOptions(storeRes.store_topping_calls, toppingRes, callOptionRes)
                setPostcallOptions(formattedOptions)

            } catch (error) {
                console.log("店舗情報取得エラー：", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStoreCallToppingData()
    }, [])

    /**
     * 店舗情報、トッピング情報、コールオプション情報から、トッピングのコール情報を整形する
     * 
     * @param store 店舗情報
     * @param toppings トッピング情報
     * @param callOptions コールオプション情報
     * 
     * @returns トッピングのコール情報
     */
    const formatToppingOptions = (
        store: SimulationSelectToppingCallsData['store_topping_calls'],
        toppings: ToppingData[],
        callOptions: CallOptionData[]
    ) => {
        // トッピングIDごとの一時データ保持用オブジェクト
        const optionMap: Record<string, PostCallOptions> = {}

        // 店舗別コールトッピング情報から画面表示用にデータ整形を行う
        store?.forEach((call) => {
            // 店舗別トッピングコール情報に合致するトッピングとコールオプションを取得
            const topping = toppings.find(t => String(t.id) === call.topping_id)
            const callOption = callOptions.find(co => String(co.id) === call.call_option_id)

            console.log("トッピング配列情報：", topping)
            console.log("コールオプション配列情報：", callOption)

            if (!topping || !callOption) return

            // マップに存在しない場合は初期化
            if (!optionMap[topping.id]) {
                optionMap[topping.id] = {
                    toppingId: topping.id,
                    toppingName: topping.topping_name,
                    options: []
                }
            }
            // マップに店舗別トッピングコール情報を設定する。
            optionMap[topping.id].options.push({
                optionId: callOption.id,
                optionName: callOption.call_option_name
            })
            console.log("トッピングコール配列：", JSON.stringify(optionMap, null, 2))
        })
        // オブジェクト→配列形式に変換して返却
        return Object.values(optionMap)
    }

    /**
     * ラジオボタン選択時の処理
     * 選択されたトッピングIDと選択されたコールオプションIDをstateに保存する
     * @param toppingId トッピングID
     * @param optionId コールオプションID
     */
    const handleOptionChange = (toppingId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [toppingId]: optionId
        }))
    }


    const handleCallOption = () => {

        // 未選択の場合はエラーとする。
        if (Object.keys(selectedOptions).length === 0) {
            setError("オプションが選択されてません")
            setSnackBarVisible(true)
            return
        }

        let callText = ""

        // 選択されたオプションからコール文字列を作成
        postcallOptions.forEach(callOption => {
            // 選択したトッピングIDに紐づくオプション情報を取得する
            const selectedOptionId = selectedOptions[callOption.toppingId]
            if (!selectedOptionId) return

            const selectedOption = callOption.options.find(opt => String(opt.optionId) === selectedOptionId)
            if (!selectedOption) return

            if (callText) callText += `\n`

            // ちょいマシの場合はトッピング名のみ設定
            if (String(selectedOption.optionName) === "ちょいマシ") {
                callText += `${callOption.toppingName}`
            } else {
                callText += `${callOption.toppingName}${selectedOption?.optionName}`
            }
        })

        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/postcall_result`,
            params: { callText }
        })
    }

    // ローディング表示
    if (loading) {
        return <LoadingErrorContainer loading={loading} error={null} />
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            <HeaderAppBar showBackButton={true} title="コールシミュレーション" />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}>
                <Card style={styles.cardContainer}>
                    <Card.Cover
                        source={{ uri: postCallImage.uri }}
                    />
                </Card>
                <Text style={styles.description}>
                    ラーメンが出来上がりました。{'\n'}
                    店員さんから{'\n'}
                    「ニンニク入れますか」と言われました。{'\n'}
                    トッピングコールしたい{'\n'}
                    オプションを選択しましょう。
                </Text>

                {/* トッピングコールオプション情報 */}
                {postcallOptions.map((toppingOption) => (
                    <View key={toppingOption.toppingId} style={styles.radioGroup}>
                        <Text style={styles.radioLabel}>
                            {toppingOption.toppingName}
                        </Text>
                        <RadioButton.Group
                            onValueChange={(value) => (
                                handleOptionChange(
                                    String(toppingOption.toppingId),
                                    value
                                ))}
                            value={selectedOptions[toppingOption.toppingId] || ''}
                        >
                            <View style={styles.radioItemGrid}>
                                {toppingOption.options.map((option) => (
                                    <RadioButton.Item
                                        key={option.optionId}
                                        label={option.optionName}
                                        value={String(option.optionId)}
                                        labelVariant="labelLarge"
                                    />
                                ))}
                            </View>
                        </RadioButton.Group>
                    </View>
                ))}

                {/* コールボタン */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={() => { router.push(`simulation/afterfinish`) }}
                    >
                        トッピング無し
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleCallOption}
                    >
                        トッピング有り
                    </Button>
                </View>
            </ScrollView>

            {/* フッター */}
            <BottomAppBar showRoutes={["map", "create"]} />

            {/* エラー表示用スナックバー */}
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                style={{ backgroundColor: theme.colors.error }}
            >
                {error}
            </Snackbar>

        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        flex: 1,
        padding: 16
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 24

    },
    cardContainer: {
        marginBottom: 16
    },
    description: {
        lineHeight: 24,
        marginBottom: 24
    },
    radioGroup: {
        marginBottom: 16
    },
    radioLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "bold"
    },
    radioItemGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,    // ネガティブマージンでグリッドの位置調整し、横スクロールを防ぐ
        paddingHorizontal: 8
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 16
    }
})