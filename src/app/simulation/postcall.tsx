import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import postCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { getStoreToppingCalls } from "@/src/api/storeApi"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { StatusBar } from "expo-status-bar"
import { formatToppingOptions, generateCallText, ToppingOption } from "@/src/utils/toppingFormatter"
import ToppingOptionSelector from "@/src/components/store/ToppingOptionSelector"
import ErrorSnackbar from "@/src/components/feedback/ErrorSnackbar"

/**
 * @description
 * コールシミュレーション画面の着丼前コール選択画面
 *
 * @param {string} id - 店舗ID
 *
 * @returns {JSX.Element} - コールシミュレーション画面の着丼前コール選択画面
 */
export default function PostCall() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const theme = useTheme()
    const postCallImage = Asset.fromModule(postCallImageSource)

    // エラー、ローディングを管理
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)

    // 店舗別コールトッピング情報、ユーザーのラジオ選択状態を管理
    const [postcallOptions, setPostcallOptions] = useState<ToppingOption[]>([])
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
                const formattedOptions = formatToppingOptions(storeRes.store_topping_calls, toppingRes, callOptionRes, "post_call")
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
     * ラジオボタン選択時の処理
     * 選択されたトッピングIDと選択されたコールオプションIDをstateに保存する
     * @param toppingId トッピングID
     * @param optionId コールオプションID
     */
    const handleOptionChange = useCallback((toppingId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [toppingId]: optionId
        }))
    }, [])


    const handleCallOption = useCallback(() => {

        // 未選択の場合はエラーとする。
        if (Object.keys(selectedOptions).length === 0) {
            setError("オプションが選択されてません")
            setSnackBarVisible(true)
            return
        }

        let callText = ""

        // 選択されたオプションからコール文字列を作成
        callText = generateCallText(selectedOptions, postcallOptions)
        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/postcall_result`,
            params: { callText }
        })
    }, [selectedOptions, postcallOptions, id])

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
                <ToppingOptionSelector
                    options={postcallOptions}
                    selectedOptions={selectedOptions}
                    onOptionChange={handleOptionChange}
                />

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
            <ErrorSnackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                message={error}
            />

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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 16
    }
})