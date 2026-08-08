import {
    View, ScrollView, Platform, KeyboardAvoidingView, StyleSheet
} from "react-native"
import {
    Text, Button, useTheme, Switch, Snackbar,
    List
} from "react-native-paper"
import { useForm, Controller } from "react-hook-form"
import { router, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { getStoreById, updateStore } from "@/src/api/storeApi"
import { useEffect, useState } from "react"
import { StoreData } from "@/src/types/store"
import { StoreApiResponse } from "@/src/types/storeApiResponse"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { FormattedToppingOptionIds, ResultToppingCall } from "@/src/types/topping"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { FontAwesome6 } from "@expo/vector-icons"
import { generateToppingCalls } from "@/src/utils/toppingFormatter"
import StoreRegisterToppingOptionSelector from "@/src/components/store/StoreRegisterToppingOptionSelector"
import { getToppingCallOptions } from "@/src/api/toppingApi"
import FormTextInput from "@/src/components/inputs/FormTextInput"
import { STORE_TEXT_MAX_LENGTH } from "@/src/constants/validation"
import { applyApiFieldErrors } from "@/src/utils/apiErrorUtils"
import { STORE_TEXT_FIELD_NAMES, trimStoreTextFields } from "@/src/utils/storeFormUtils"

/**
 * 店舗情報更新画面コンポーネント
 * 
 * 新規店舗情報の入力と更新を行う画面
 * React Hook Formを使用してフォーム入力を管理
 * @returns 店舗情報登録フォームコンポーネント
 */
export default function StoreUpdate() {
    // フォームの状態管理 (React Hook Form)
    const { control, handleSubmit, setError, formState: { isSubmitting }, reset } = useForm<StoreData>({
        defaultValues: {
            // デフォルト値を設定
            store_name: "",
            branch_name: "",
            address: "",
            business_hours: "",
            regular_holidays: "",
            prior_meal_voucher: false,
            is_all_increased: false,
            is_lot: false,
            topping_details: "",
            call_details: "",
            lot_detail: ""

        },
        mode: "onBlur"  // フォーカスが外れた時にバリデーションを実行
    })
    const theme = useTheme()

    // スナックバーの状態管理
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarError, setSnackbarError] = useState(false)

    // トッピングとコールオプションのデータ管理
    const [toppingOptionData, setToppingOptionData] = useState<Record<number, ResultToppingCall>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // 選択したコールオプションを状態管理（事前用・着丼前用）
    const [selectedPreCallOptions, setSelectedPreCallOptions] = useState<FormattedToppingOptionIds>({})
    const [selectedPostCallOptions, setSelectedPostCallOptions] = useState<FormattedToppingOptionIds>({})

    // アコーディオンの展開状態管理
    const [preCallExpanded, setPreCallExpanded] = useState<boolean>(true)
    const [postCallExpanded, setPostCallExpanded] = useState<boolean>(true)

    // ルートパラメータから店舗IDを取得
    const { id } = useLocalSearchParams<{ id: string }>()

    // 初期ロード時にトッピングコール情報を取得する。
    useEffect(() => {
        const fetchToppingCallOptions = async () => {
            try {
                // トッピング情報とコールオプション情報を取得
                const response = await getToppingCallOptions()
                const toppingOptions: Record<number, ResultToppingCall> = response
                setToppingOptionData(toppingOptions)

            } catch (error) {
                console.error('トッピング・コールオプション情報取得エラー：', error)
                setLoadError('トッピング・コールオプション情報の取得に失敗しました。')
            } finally {
                setIsLoading(false)
            }
        }
        fetchToppingCallOptions()
    }, [])

    // 初期ロード時に店舗情報・店舗別トッピングコール情報を取得する。
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const storeData = await getStoreById(id)

                // フォームの初期値を設定
                reset({
                    store_name: storeData.store_name,
                    branch_name: storeData.branch_name || undefined,
                    address: storeData.address,
                    business_hours: storeData.business_hours,
                    regular_holidays: storeData.regular_holidays,
                    prior_meal_voucher: storeData.prior_meal_voucher,
                    is_all_increased: storeData.is_all_increased,
                    is_lot: storeData.is_lot,
                    topping_details: storeData.topping_details || undefined,
                    call_details: storeData.call_details || undefined,
                    lot_detail: storeData.lot_detail || undefined
                })

                const preToppingCalls: FormattedToppingOptionIds = storeData.preCallFormattedIds || {}
                const postToppingCalls: FormattedToppingOptionIds = storeData.postCallFormattedIds || {}

                // console.log("preToppingCalls", JSON.stringify(preToppingCalls, null, 2))
                // console.log("postToppingCalls", JSON.stringify(postToppingCalls, null, 2))

                setSelectedPreCallOptions(preToppingCalls)
                setSelectedPostCallOptions(postToppingCalls)


            } catch (error) {
                console.error("店舗情報取得エラー：", error)
                setLoadError("店舗情報取得処理に失敗しました。")
            }
        }
        fetchStoreData()
    }, [id, reset])

    /**
     * フォーム送信時の処理
     * @param data フォームから送信されたデータ
     */
    const onSubmit = async (data: StoreData) => {
        try {
            // トッピング情報を生成
            const toppingCalls = generateToppingCalls(
                selectedPreCallOptions,
                selectedPostCallOptions
            )

            // 送信データを作成（保存値と揃えるためテキスト項目はtrim済みで送る）
            const submitData = {
                ...trimStoreTextFields(data),
                topping_calls: toppingCalls
            }

            // console.log("送信トッピング情報", toppingCalls)   // デバッグ用ログ出力
            // console.log("送信データ情報", submitData)   // デバッグ用ログ出力

            // APIを使用して店舗情報を登録
            const response: StoreApiResponse = await updateStore(id, submitData)
            // console.log("店舗登録レスポンス情報：", JSON.stringify(response, null, 2))
            // 成功メッセージを表示
            setSnackbarMessage(response.message)
            setSnackbarError(false)
            setSnackbarVisible(true)

            // タイマーで遅延させた後に詳細画面へ遷移
            setTimeout(() => {
                router.push({
                    pathname: 'store/detail',
                    params: { id: String(response.data.store.id) }
                })
            }, 3000)


        } catch (error) {
            // エラー処理
            // 400のdetailsは各入力欄のインラインエラーへ回し、
            // 入力欄を持たない項目の分だけスナックバーに出す
            console.error("店舗情報更新エラー：", error)
            setSnackbarMessage(applyApiFieldErrors(
                error,
                setError,
                STORE_TEXT_FIELD_NAMES,
                "店舗情報更新処理でエラーが発生しました"
            ))
            setSnackbarError(true)
            setSnackbarVisible(true)
        }
    }

    // SnackBar表示後に画面遷移
    const handleSnackbarDismiss = () => {
        setSnackbarVisible(false)
    }

    /**
     * チェックボックスの状態変更を処理する
     * @param toppingId トッピングID
     * @param optionId コールオプションID
     * @param isChecked チェック状態
     * @param callType コールタイプ（pre_call または post_call）
     */
    const handleCheckboxChange = (toppingId: number, optionId: number, isChecked: boolean, callType: 'pre_call' | 'post_call') => {
        // コールタイプに従ってセット関数を確定する
        const setSelectedOptions = callType === 'pre_call'
            ? setSelectedPreCallOptions
            : setSelectedPostCallOptions

        setSelectedOptions((prev) => {
            const currentOptions = [...(prev[toppingId] || [])]

            console.log("チェックボックス状態：", currentOptions)
            if (isChecked) {
                // オプション追加
                if (!currentOptions.includes(optionId)) {
                    return {
                        ...prev,
                        [toppingId]: [...currentOptions, optionId]
                    }
                }
            } else {
                // オプション削除
                return {
                    ...prev,
                    [toppingId]: currentOptions.filter(id => id !== optionId)
                }
            }
            return prev
        })
    }

    // データ読み込み中の表示
    if (isLoading) {
        return <LoadingErrorContainer loading={isLoading} error={null} />
    }
    // データ読み込みエラー時の処理
    if (loadError) {
        return <LoadingErrorContainer loading={false} error={loadError} />
    }

    return (
        // 安全領域を確保するためのコンテナ
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={[]}
        >
            {/* キーボード表示時に入力フィールドがキーボードに隠れないようにするコンテナ */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 32} // iOSでオフセットを追加
            >
                {/* 画面上部のナビゲーションバー */}
                <HeaderAppBar
                    title="店舗情報更新"
                    showBackButton={true}
                // rightAction={{ icon: "microphone", onPress: () => { } }}
                />
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                >
                    <StatusBar style={theme.dark ? "light" : "dark"} />
                    {/* 基本情報入力フィールド群 */}
                    <FormTextInput
                        control={control}
                        name="store_name"
                        label="店舗名"
                        isRequired={true}
                        maxLength={STORE_TEXT_MAX_LENGTH.STORE_NAME}
                    />
                    <FormTextInput
                        control={control}
                        name="branch_name"
                        label="支店名"
                        maxLength={STORE_TEXT_MAX_LENGTH.BRANCH_NAME}
                    />
                    <FormTextInput
                        control={control}
                        name="address"
                        label="住所"
                        isRequired={true}
                        maxLength={STORE_TEXT_MAX_LENGTH.ADDRESS}
                    />
                    <FormTextInput
                        control={control}
                        name="business_hours"
                        label="営業時間"
                        isRequired={true}
                        maxLength={STORE_TEXT_MAX_LENGTH.BUSINESS_HOURS}
                    />
                    <FormTextInput
                        control={control}
                        name="regular_holidays"
                        label="定休日"
                        isRequired={true}
                        maxLength={STORE_TEXT_MAX_LENGTH.REGULAR_HOLIDAYS}
                    />

                    {/* 事前食券購入有無ラジオボタン */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>事前食券購入の有無</Text>
                        <Controller
                            control={control}
                            name="prior_meal_voucher"
                            render={({ field: { onChange, value } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={onChange}
                                    color={theme.colors.primary}
                                />
                            )}
                        />
                    </View>
                    {/* トッピングコール詳細入力フィールド群 */}
                    <Text style={styles.sectionTitle}>トッピングコール情報</Text>
                    {/* 事前用トッピングコール情報 */}
                    <List.Accordion
                        title="事前トッピングコール情報"
                        left={props => <List.Icon {...props} icon="clipboard-outline" />}
                        expanded={preCallExpanded}
                        onPress={() => setPreCallExpanded(!preCallExpanded)}
                        style={styles.accordion}
                    >
                        <StoreRegisterToppingOptionSelector
                            toppingOptions={toppingOptionData}
                            selectedOptions={selectedPreCallOptions}
                            onOptionChange={(toppingId, optionId, isChecked) =>
                                handleCheckboxChange(toppingId, optionId, isChecked, 'pre_call')
                            }
                            callType="pre_call"
                        />
                    </List.Accordion>

                    {/* 着丼前用トッピングコール情報 */}
                    <List.Accordion
                        title="着丼前用トッピングコール情報"
                        left={props => (
                            <List.Icon
                                {...props}
                                icon={({ size, color }) => (
                                    <FontAwesome6 name="bowl-food" size={size} color={color} />
                                )}
                            />
                        )}
                        expanded={postCallExpanded}
                        onPress={() => setPostCallExpanded(!postCallExpanded)}
                        style={styles.accordion}
                    >
                        <StoreRegisterToppingOptionSelector
                            toppingOptions={toppingOptionData}
                            selectedOptions={selectedPostCallOptions}
                            onOptionChange={(toppingId, optionId, isChecked) =>
                                handleCheckboxChange(toppingId, optionId, isChecked, 'post_call')
                            }
                            callType="post_call"
                        />
                    </List.Accordion>

                    {/* 詳細情報入力フィールド群 */}
                    <FormTextInput
                        control={control}
                        name="topping_details"
                        label="トッピング詳細"
                        maxLength={STORE_TEXT_MAX_LENGTH.TOPPING_DETAILS}
                        multiline={true}
                        numberOfLines={4}
                    />

                    <FormTextInput
                        control={control}
                        name="call_details"
                        label="コール詳細"
                        maxLength={STORE_TEXT_MAX_LENGTH.CALL_DETAILS}
                        multiline={true}
                        numberOfLines={4}
                    />

                    {/* 全体増量の有無ラジオ選択 */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>全マシの有無</Text>
                        <Controller
                            control={control}
                            name="is_all_increased"
                            render={({ field: { onChange, value } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={onChange}
                                    color={theme.colors.primary}
                                />
                            )}
                        />
                    </View>

                    {/* ロット制の有無ラジオ選択と詳細 */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>ロット制の有無</Text>
                        <Controller
                            control={control}
                            name="is_lot"
                            render={({ field: { onChange, value } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={onChange}
                                    color={theme.colors.primary}
                                />
                            )}
                        />
                    </View>
                    <FormTextInput
                        control={control}
                        name="lot_detail"
                        label="ロット詳細"
                        maxLength={STORE_TEXT_MAX_LENGTH.LOT_DETAIL}
                        multiline={true}
                        numberOfLines={4}
                    />
                    {/* 登録ボタン */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit(
                            onSubmit, () => {
                                setSnackbarMessage("必須項目を入力してください")
                                setSnackbarError(true)
                                setSnackbarVisible(true)
                            })}
                        style={{ marginTop: 16 }}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        更新
                    </Button>
                </ScrollView>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={handleSnackbarDismiss}
                    duration={3000}
                    style={{
                        backgroundColor: snackbarError ? theme.colors.error : theme.colors.primary
                    }}
                    wrapperStyle={{
                        bottom: Platform.OS === 'ios' ? 20 : 10
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        padding: 16
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 32
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 16
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.3)"
    },
    toggleLabel: {
        fontSize: 16
    },
    optionContainer: {
        marginBottom: 16
    },
    optionLabel: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "bold"
    },
    optionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8    // ネガティブマージンでグリッドの位置調整し、横スクロールを防ぐ
    },
    checkboxContainer: {
        width: "50%",   // 2列に並べる
        paddingHorizontal: 8
    },
    checkboxItem: {
        padding: 8
    },
    checkboxLabel: {
        fontSize: 14
    },
    accordion: {
        marginBottom: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }
})