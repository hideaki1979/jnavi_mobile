import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, RadioButton, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import postCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { getStoreById } from "@/src/api/storeApi"
import { ApiStoreData } from "@/src/types/storeApiResponse"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import { CallOptionData, ToppingData } from "@/src/types/topping"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { StatusBar } from "expo-status-bar"

interface FormattedOptions {
    [toppingName: string]: string[]
}

export default function PostCall() {
    const theme = useTheme()
    const postCallImage = Asset.fromModule(postCallImageSource)

    // ラジオボタンの選択状態を管理
    const [toppingSelections, setToppingSelections] = useState<{ [key: string]: string }>({})
    const [loading, setLoading] = useState<boolean>(true)
    const [, setStoreData] = useState<ApiStoreData | null>(null)
    const [formattedOptions, setFormattedOptions] = useState<FormattedOptions>({})

    // APIからコールトッピング情報を取得
    useEffect(() => {
        const fetchStoreCallToppingData = async () => {
            try {
                // 店舗情報・トッピングコール情報を並列で取得する。(IDは暫定で固定)
                const [storeRes, toppingRes, callOptionRes] = await Promise.all([
                    getStoreById('13'),
                    getToppings(),
                    getCallOptions()
                ])
                setStoreData(storeRes)

                // トッピングデータがある場合は整形する
                // 例：{ "ニンニク": ["抜き", "少なめ", "マシ"], "野菜": ["ちょいマシ", "マシ", "マシマシ"] }
                if (storeRes.store_topping_calls && storeRes.store_topping_calls.length > 0) {
                    formatToppingOptions(storeRes, toppingRes, callOptionRes)
                }
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
        store: ApiStoreData,
        toppings: ToppingData[],
        callOptions: CallOptionData[]
    ) => {
        // 店舗別トッピングコールがない場合は、整形無しでリターン
        if (!store.store_topping_calls) return

        // トッピング用のオブジェクト初期化
        const formatted: FormattedOptions = {}

        // 各種トッピングのコール情報を格納する
        store.store_topping_calls.map((topping_call) => {
            // トッピングとコールオプションを取得
            const topping = toppings.find(t => t.id === topping_call.topping_id)
            const callOption = callOptions.find(co => co.id === topping_call.call_option_id)

            console.log("トッピング配列情報：", topping)
            console.log("コールオプション配列情報：", callOption)

            if (!topping || !callOption) return

            // トッピングコールオプションをオブジェクト配列形式に整形する。
            // { "ニンニク": ["マシ", "マシマシ"], "野菜": ["抜き", "少し", "ちょいマシ"] }
            if (!formatted[topping.topping_name]) {
                formatted[topping.topping_name] = []
            }
            formatted[topping.topping_name].push(callOption.call_option_name)
            console.log("トッピングコール配列：", formatted)
        })
        setFormattedOptions(formatted)
    }

    const handleCallOption = () => {
        let callText = ""

        // 各種トッピングについて処理
        Object.entries(toppingSelections).forEach(([toppingName, selection]) => {
            if (selection) {
                // 既に他のトッピングがある場合は改行を追加
                if (callText) callText += "\n"

                // 「ちょいマシ」の場合は名前のみ表示（例：「ニンニク」）
                if (selection === "ちょいマシ") {
                    callText += toppingName
                } else {
                    // 上記以外は「トッピング名＋選択肢」を表示（例：「ニンニクマシ」）
                    callText += toppingName + selection
                }
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
                {Object.entries(formattedOptions).map(([toppingName, options]: [string, string[]]) => (
                    <View key={toppingName} style={styles.radioGroup}>
                        <Text style={styles.radioLabel}>
                            {toppingName}
                        </Text>
                        <RadioButton.Group
                            onValueChange={(value) => {
                                setToppingSelections(prev => ({
                                    ...prev,
                                    [toppingName]: value
                                }))
                            }}
                            value={toppingSelections[toppingName] || ''}
                        >
                            <View style={styles.radioItemGrid}>
                                {options.map((option: string, index: number) => (
                                    <RadioButton.Item key={index} label={option} value={option} labelVariant="labelLarge" />
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