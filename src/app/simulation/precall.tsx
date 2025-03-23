import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, RadioButton, Snackbar, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import preCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { StatusBar } from "expo-status-bar"
import { SimulationSelectToppingCallsData } from "@/src/types/storeApiResponse"
import { CallOptionData, ToppingData } from "@/src/types/topping"
import { getStoreToppingCalls } from "@/src/api/storeApi"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"

// トッピングカテゴリごとのオプション一覧の型定義
interface PreCallOption {
    toppingId: string | number;
    toppingName: string;
    options: {
        optionId: string | number;
        optionName: string;
    }[];
}

export default function PreCall() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const preCallImage = Asset.fromModule(preCallImageSource)
    const theme = useTheme()

    // ローディング、エラー、Snackbar状態管理
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)

    // 店舗別コールトッピング情報、ユーザーの選択状態を管理
    const [preCallOptions, setPreCallOptions] = useState<PreCallOption[]>([])
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    // APIから店舗＋トッピングオプションデータ取得
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // 店舗情報とコールトッピング情報を並列で取得
                const [storeRes, toppingRes, callOptionRes] =
                    await Promise.all([
                        getStoreToppingCalls(id, "pre_call"),
                        getToppings(),
                        getCallOptions()
                    ])

                // データがない場合は早期リターン
                if (!storeRes.store_topping_calls || storeRes.store_topping_calls.length === 0) {
                    setLoading(false)
                    return
                }
                // console.log("店舗情報＆トッピングコール情報取得：", JSON.stringify(storeRes, null, 2))
                // console.log("トッピング情報：", JSON.stringify(toppingRes, null, 2))
                // console.log("コールオプション情報：", JSON.stringify(callOptionRes, null, 2))

                // 店舗の事前コールオプションを整形
                const formattedOptions = formatPreOptions(storeRes.store_topping_calls, toppingRes, callOptionRes)
                setPreCallOptions(formattedOptions)
            } catch (error) {
                console.error("店舗情報＆トッピングコール情報取得エラー：", error)
                setError(error instanceof Error ? error.message : "店舗情報＆トッピングコール情報取得時にエラーが発生しました。")
                setSnackBarVisible(true)
            } finally {
                setLoading(false)
            }
        }
        fetchStoreData()
    }, [])

    // 事前コールオプションを表示用に整形
    const formatPreOptions = (
        storeToppingCalls: SimulationSelectToppingCallsData['store_topping_calls'],
        toppings: ToppingData[],
        callOptions: CallOptionData[]
    ): PreCallOption[] => {
        // トッピングIDごとの一時データ保持用オブジェクト
        const optionMap: Record<string, PreCallOption> = {}
        console.log("storeToppingCalls：", JSON.stringify(storeToppingCalls, null, 2))

        // 各トッピングコールをループ処理
        storeToppingCalls?.forEach((call) => {
            const topping = toppings.find(t => String(t.id) === call.topping_id)
            const callOption = callOptions.find(co => String(co.id) === call.call_option_id)
            console.log("topping：", topping)
            console.log("callOption：", callOption)

            if (!topping || !callOption) return

            // マップに存在しない場合は初期化
            if (!optionMap[topping.id]) {
                optionMap[topping.id] = {
                    toppingId: topping.id,
                    toppingName: topping.topping_name,
                    options: []
                }
            }

            // オプションを追加
            optionMap[topping.id].options.push({
                optionId: String(callOption.id),
                optionName: callOption.call_option_name
            })
            console.log("optionMap：", JSON.stringify(optionMap, null, 2))

        })
        console.log("最終結果：", JSON.stringify(Object.values(optionMap)))
        // オブジェクトから配列に変換して返す
        return Object.values(optionMap)
    }

    // ラジオボタン選択時の処理
    const handleOptionChange = (toppingId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [toppingId]: optionId
        }))

    }

    /**
     * コールボタン押下時の処理
     * 選択されたトッピングのコールオプションを基にコール文字列を作成し、トッピングコール結果画面に遷移する。
     * @returns {void}
     */
    const handleCallOption = () => {
        // 未選択の場合はエラーとする。
        if (Object.keys(selectedOptions).length === 0) {
            setError("オプションが選択されていません")
            setSnackBarVisible(true)
            return
        }

        let callText = ""

        // 選択されたオプションからコール文字列を作成
        preCallOptions.forEach(option => {
            console.log("option：", option)
            const selectedOptionId = selectedOptions[option.toppingId]
            console.log("selectedOptionId：", selectedOptionId)
            if (!selectedOptionId) return
            const selectedOption = option.options.find(opt => String(opt.optionId) === selectedOptionId)
            console.log("selectedOption", selectedOption)
            if (!selectedOption) return
            if (callText) callText += `\n`

            // 麺の硬さ（ID：5）、または麺量（ID: 6）の場合は「麺〜（コールオプション名）」を設定
            if (String(option.toppingId) === "5" || String(option.toppingId) === "6") {
                callText += `麺${selectedOption.optionName}`
            } else {
                callText += `${option.toppingName}${selectedOption.optionName}`
            }
        })

        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/precall_result`,
            params: { callText, id }
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
                        source={{ uri: preCallImage.uri }}
                    />
                </Card>
                <Text style={styles.description}>
                    行列に並んでいると、店員さんから{'\n'}
                    食券を見せてください」と言われました。{'\n'}
                    食券を見せると同時に、{'\n'}
                    事前コールしたいオプションを選択しましょう。
                </Text>

                {/* 動的に事前コールのラジオボタングループを生成 */}
                {preCallOptions.map((option) => (
                    <View key={option.toppingId} style={styles.radioGroup}>
                        <Text style={styles.radioLabel}>{option.toppingName}</Text>
                        <RadioButton.Group
                            onValueChange={(value) => handleOptionChange(String(option.toppingId), value)}
                            value={selectedOptions[option.toppingId] || ""}
                        >
                            <View style={styles.radioItemGrid}>
                                {option.options.map((callOption) => (
                                    <RadioButton.Item
                                        key={callOption.optionId}
                                        label={callOption.optionName}
                                        value={String(callOption.optionId)}
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
                        onPress={() => {
                            router.push(`simulation/postcall/${id}`)
                        }}
                    >
                        コール無し
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleCallOption}
                    >
                        コール有り
                    </Button>
                </View>
            </ScrollView>

            {/* フッター */}
            <BottomAppBar showRoutes={['map', 'create']} />

            {/* エラー表示用スナックバー */}
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                style={{ backgroundColor: theme.colors.error }}
            >
                {error}
            </Snackbar>

        </SafeAreaView>
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
    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})