import {
    View, ScrollView, Platform, KeyboardAvoidingView, StyleSheet
} from "react-native"
import {
    Text, TextInput, Button, Checkbox, useTheme, Switch, Snackbar,
    List
} from "react-native-paper"
import { useForm, Controller } from "react-hook-form"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { createStore } from "@/src/api/storeApi"
import { useEffect, useMemo, useState } from "react"
import { StoreData, ToppingCall } from "@/src/types/store"
import { StoreApiResponse } from "@/src/types/storeApiResponse"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { CallOptionData, ToppingData } from "@/src/types/topping"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { FontAwesome6 } from "@expo/vector-icons"

/**
 * 店舗情報登録画面コンポーネント
 * 
 * 新規店舗情報の入力と登録を行う画面
 * React Hook Formを使用してフォーム入力を管理
 * @returns 店舗情報登録フォームコンポーネント
 */
export default function StoreCreate() {
    // フォームの状態管理 (React Hook Form)
    const { control, handleSubmit, formState: { isSubmitting } } = useForm<StoreData>({
        defaultValues: {
            // デフォルト値を設定
            store_name: "",
            address: "",
            business_hours: "",
            regular_holidays: "",
            prior_meal_voucher: false,
            is_all_increased: false,
            is_lot: false
        },
        mode: "onBlur"  // フォーカスが外れた時にバリデーションを実行
    })
    const theme = useTheme()

    // スナックバーの状態管理
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarError, setSnackbarError] = useState(false)

    // トッピングとコールオプションのデータ管理
    const [toppings, setToppings] = useState<ToppingData[]>([])
    const [callOptions, setCallOptions] = useState<CallOptionData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // 選択したコールオプションを状態管理（事前用・着丼前用）
    const [selectedPreCallOptions, setSelectedPreCallOptions] = useState<Record<number, number[]>>([])
    const [selectedPostCallOptions, setSelectedPostCallOptions] = useState<Record<number, number[]>>([])

    // アコーディオンの展開状態管理
    const [preCallExpanded, setPreCallExpanded] = useState<boolean>(true)
    const [postCallExpanded, setPostCallExpanded] = useState<boolean>(true)

    // 初期ロード時にトッピング情報・コールオプション情報を取得
    useEffect(() => {
        const fetchToppingCallOptions = async () => {
            try {
                // // トッピング情報とコールオプション情報を並列で取得
                const [toppingResponse, callOptionResponse] =
                    await Promise.all([
                        getToppings(), getCallOptions()
                    ])
                setToppings(toppingResponse)
                setCallOptions(callOptionResponse)

                // 選択状態の初期化（事前・着丼前）
                const initSelectedOptions: Record<number, number[]> = {}
                toppingResponse.forEach(topping => {
                    initSelectedOptions[topping.id] = []
                })
                setSelectedPreCallOptions({ ...initSelectedOptions })
                setSelectedPostCallOptions({ ...initSelectedOptions })

            } catch (error) {
                console.error('トッピング・コールオプション情報取得エラー：', error)
                setLoadError('トッピング・コールオプション情報の取得に失敗しました。')
            } finally {
                setIsLoading(false)
            }
        }
        fetchToppingCallOptions()
    }, [])

    /**
     * フォーム送信時の処理
     * @param data フォームから送信されたデータ
     */
    const onSubmit = async (data: StoreData) => {
        try {
            // トッピング情報を生成
            const toppingCalls = generateToppingCalls()

            // 送信データを作成
            const submitData = {
                ...data,
                topping_calls: toppingCalls
            }

            // console.log("送信トッピング情報", toppingCalls)   // デバッグ用ログ出力
            // console.log("送信データ情報", submitData)   // デバッグ用ログ出力

            // APIを使用して店舗情報を登録
            const response: StoreApiResponse = await createStore(submitData)
            // console.log("店舗登録レスポンス情報：", JSON.stringify(response, null, 2))
            // 成功メッセージを表示
            setSnackbarMessage("店舗情報を登録しました")
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
            setSnackbarMessage(error instanceof Error ? error.message : "店舗情報登録処理でエラーが発生しました")
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
    const handleCheckboxChange = (toppingId: number, optionId: number, isChecked: boolean, callType: string) => {
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

    // トッピングカテゴリー別コールオプションのマップをメモ化
    const toppingCategoryOptionsMap = useMemo(() => {
        const map: Record<number, CallOptionData[]> = {}

        // 各トッピングカテゴリーに対応するコールオプションを事前に計算
        if (toppings.length > 0 && callOptions.length > 0) {
            // トッピングの種類ごとに結果をマップに保存する
            toppings.forEach(topping => {
                const categoryId = topping.topping_category

                // カテゴリが登録されていない場合のみ処理
                if (!map[categoryId]) {
                    // そのカテゴリに対応するコールオプションをフィルタリング
                    const optionForCategory = callOptions.filter(option =>
                        option.call_category === categoryId
                    )
                    // 結果をマップに保存
                    map[categoryId] = optionForCategory
                }
                console.log("MAP保存情報：", map)
            })
        }
        console.log("マップ全体情報：", map)
        // 作成したマップを返す
        return map
    }, [toppings, callOptions]) // トッピングがコールオプションが変更時のみ再計算

    /**
     * 選択されたトッピングとコールオプションからIDのマッピングを生成する
     */
    const generateToppingCalls = (): ToppingCall[] => {
        const result: ToppingCall[] = []

        // 選択されたオプションをループして、事前用のtopping_callsのデータを作成
        Object.entries(selectedPreCallOptions).forEach(([toppingIdStr, optionIds]) => {
            const toppingId = Number(toppingIdStr)
            optionIds.forEach(optionId => {
                // ToppingCallの配列にプッシュする
                result.push({
                    topping_id: toppingId,
                    call_option_id: optionId,
                    call_timing: "pre_call",
                    noodle_type_id: 1
                })
            })
        })

        // 選択されたオプションをループして、着丼前用topping_callsのデータを作成
        Object.entries(selectedPostCallOptions).forEach(([toppingIdStr, optionIds]) => {
            const toppingId = Number(toppingIdStr)
            optionIds.forEach(optionId => {
                // ToppingCallの配列にプッシュする
                result.push({
                    topping_id: toppingId,
                    call_option_id: optionId,
                    call_timing: "post_call",
                    noodle_type_id: 1
                })
            })
        })
        console.log("選択コールオプション：", result)
        return result
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
                    title="店舗情報登録"
                    showBackButton={true}
                    rightAction={{ icon: "microphone", onPress: () => { } }}
                />
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                >
                    <StatusBar style={theme.dark ? "light" : "dark"} />
                    {/* 基本情報入力フィールド群 */}
                    <Controller
                        control={control}
                        name="store_name"
                        rules={{
                            required: "店舗名は必須項目です"
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    label={
                                        <Text>
                                            店舗名 <Text style={{ color: theme.colors.error }}>*</Text>
                                        </Text>
                                    }
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    onBlur={field.onBlur}
                                    error={!!error}
                                />
                                {error && (
                                    <Text style={{ color: theme.colors.error, fontSize: 10 }}>
                                        {error.message}
                                    </Text>
                                )}
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        name="branch_name"
                        render={({ field }) => (
                            <TextInput
                                mode="outlined"
                                label="支店名"
                                value={field.value}
                                onChangeText={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="address"
                        rules={{
                            required: "住所は必須項目です"
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    label={
                                        <Text>
                                            住所 <Text style={{ color: theme.colors.error }}>*</Text>
                                        </Text>
                                    }
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    onBlur={field.onBlur}
                                    error={!!error}
                                />
                                {error && (
                                    <Text style={{ color: theme.colors.error, fontSize: 10 }}>
                                        {error.message}
                                    </Text>
                                )}
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        name="business_hours"
                        rules={{
                            required: "営業時間は必須項目です"
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    label={
                                        <Text>
                                            営業時間 <Text style={{ color: theme.colors.error }}>*</Text>
                                        </Text>
                                    }
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    onBlur={field.onBlur}
                                    error={!!error}
                                />
                                {error && (
                                    <Text style={{ color: theme.colors.error, fontSize: 10 }}>
                                        {error.message}
                                    </Text>
                                )}
                            </>
                        )}
                    />
                    <Controller
                        control={control}
                        name="regular_holidays"
                        rules={{
                            required: "定休日は必須項目です"
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    label={
                                        <Text>
                                            定休日 <Text style={{ color: theme.colors.error }}>*</Text>
                                        </Text>
                                    }
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    onBlur={field.onBlur}
                                    error={!!error}
                                />
                                {error && (
                                    <Text style={{ color: theme.colors.error, fontSize: 10 }}>
                                        {error.message}
                                    </Text>
                                )}
                            </>
                        )}
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
                        {toppings.map(topping => {
                            // トッピングカテゴリーに対応するコールオプションを取得
                            const toppingCallOptions = toppingCategoryOptionsMap[topping.topping_category] || []
                            return (
                                <View key={`pre-${topping.id}`} style={styles.optionContainer}>
                                    <Text style={styles.optionLabel}>{topping.topping_name}</Text>
                                    <View style={styles.optionGrid}>
                                        {toppingCallOptions.map((option) => (
                                            <View key={option.id} style={styles.checkboxContainer}>
                                                <Checkbox.Item
                                                    label={option.call_option_name}
                                                    status={selectedPreCallOptions[topping.id].includes(option.id) ? "checked" : "unchecked"}
                                                    onPress={() => handleCheckboxChange(
                                                        topping.id,
                                                        option.id,
                                                        !selectedPreCallOptions[topping.id]?.includes(option.id),
                                                        "pre_call"
                                                    )}
                                                    style={styles.checkboxItem}
                                                    labelStyle={styles.checkboxLabel}
                                                    mode={Platform.OS === "ios" ? "ios" : "android"}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        })}
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
                        {toppings.map(topping => {
                            // トッピングカテゴリーに対応するコールオプションを取得
                            const toppingCallOptions = toppingCategoryOptionsMap[topping.topping_category] || []
                            return (
                                <View key={`post-${topping.id}`} style={styles.optionContainer}>
                                    <Text style={styles.optionLabel}>{topping.topping_name}</Text>
                                    <View style={styles.optionGrid}>
                                        {toppingCallOptions.map((option) => (
                                            <View key={option.id} style={styles.checkboxContainer}>
                                                <Checkbox.Item
                                                    label={option.call_option_name}
                                                    status={selectedPostCallOptions[topping.id].includes(option.id) ? "checked" : "unchecked"}
                                                    onPress={() => handleCheckboxChange(
                                                        topping.id,
                                                        option.id,
                                                        !selectedPostCallOptions[topping.id]?.includes(option.id),
                                                        "post_call"
                                                    )}
                                                    style={styles.checkboxItem}
                                                    labelStyle={styles.checkboxLabel}
                                                    mode={Platform.OS === "ios" ? "ios" : "android"}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )
                        })}
                    </List.Accordion>

                    {/* 詳細情報入力フィールド群 */}
                    <Controller
                        control={control}
                        name="topping_details"
                        render={({ field }) => (
                            <TextInput
                                mode="outlined"
                                label="トッピング詳細"
                                value={field.value}
                                onChangeText={field.onChange}
                                multiline={true}
                                numberOfLines={4}
                                style={{
                                    minHeight: 120
                                }}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="call_details"
                        render={({ field }) => (
                            <TextInput
                                mode="outlined"
                                label="コール詳細"
                                value={field.value}
                                onChangeText={field.onChange}
                                multiline={true}
                                numberOfLines={4}
                                style={{ minHeight: 120 }}
                            />
                        )}
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
                    <Controller
                        control={control}
                        name="lot_detail"
                        render={({ field }) => (
                            <TextInput
                                mode="outlined"
                                label="ロット詳細"
                                value={field.value}
                                onChangeText={field.onChange}
                                multiline={true}
                                numberOfLines={4}
                                style={{ minHeight: 120 }}
                            />
                        )}
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
                        登録
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