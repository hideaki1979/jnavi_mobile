import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import preCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { StatusBar } from "expo-status-bar"
import { getStoreToppingCalls } from "@/src/api/storeApi"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { generateCallText } from "@/src/utils/toppingFormatter"
import ToppingOptionSelector from "@/src/components/store/ToppingOptionSelector"
import ErrorSnackbar from "@/src/components/feedback/ErrorSnackbar"
import { SimulationToppingOption } from "@/src/types/storeApiResponse"

/**
 * @description
 * コールシミュレーション画面の事前コール選択画面
 *
 * @param {string} id - 店舗ID
 *
 * @returns {JSX.Element} - コールシミュレーション画面の事前コール選択画面
 */
export default function PreCall() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const preCallImage = Asset.fromModule(preCallImageSource)
    const theme = useTheme()

    // ローディング、エラー、Snackbar状態管理
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)

    // 店舗別コールトッピング情報、ユーザーの選択状態を管理
    const [preCallOptions, setPreCallOptions] = useState<SimulationToppingOption[]>([])
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    // APIから店舗＋トッピングオプションデータ取得
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // 店舗情報とコールトッピング情報（データ整形済）を取得
                const storeRes = await getStoreToppingCalls(id, "pre_call")

                // データがない場合は早期リターン
                if (!storeRes.formattedToppingOptions || storeRes.formattedToppingOptions.length === 0) {
                    setLoading(false)
                    return
                }
                // console.log("店舗情報＆トッピングコール情報取得：", JSON.stringify(storeRes, null, 2))

                // MAPからオプションの配列を抽出
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const toppingOptions = storeRes.formattedToppingOptions.map(([_, toppingOption]) => toppingOption)
                setPreCallOptions(toppingOptions)
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

    // ラジオボタン選択時の処理
    const handleOptionChange = useCallback((toppingId: string, optionId: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [toppingId]: optionId
        }))
    }, [])

    /**
     * コールボタン押下時の処理
     * 選択されたトッピングのコールオプションを基にコール文字列を作成し、トッピングコール結果画面に遷移する。
     * @returns {void}
     */
    const handleCallOption = useCallback(() => {
        // 未選択の場合はエラーとする。
        if (Object.keys(selectedOptions).length === 0) {
            setError("オプションが選択されていません")
            setSnackBarVisible(true)
            return
        }

        let callText = ""

        // 選択されたオプションからコール文字列を作成
        callText = generateCallText(selectedOptions, preCallOptions)

        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/precall_result`,
            params: { callText, id }
        })
    }, [selectedOptions, preCallOptions, id])

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
                    「食券を見せてください」と言われました。{'\n'}
                    食券を見せると同時に、{'\n'}
                    事前コールしたいオプションを選択しましょう。
                </Text>

                {/* 動的に事前コールのラジオボタングループを生成 */}
                <ToppingOptionSelector
                    options={preCallOptions}
                    selectedOptions={selectedOptions}
                    onOptionChange={handleOptionChange}
                />

                {/* コールボタン */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={() => {
                            router.push({
                                pathname: "simulation/postcall",
                                params: { id }
                            })
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
            <ErrorSnackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                message={error}
            />
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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 16
    }
})