import {
    View, ScrollView, Platform, KeyboardAvoidingView, StyleSheet
} from "react-native"
import {
    Text, TextInput, Button, Checkbox, Appbar, useTheme, Switch, Snackbar
} from "react-native-paper"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { createStore } from "@/src/api/api"
import { useState } from "react"
import { StoreData } from "@/src/types/store"
import { StoreApiResponse } from "@/src/types/storeApiResponse"

/**
 * 店舗情報登録画面コンポーネント
 * 
 * 新規店舗情報の入力と登録を行う画面
 * React Hook Formを使用してフォーム入力を管理
 * @returns 店舗情報登録フォームコンポーネント
 */
export default function StoreCreate() {
    // フォームの状態管理 (React Hook Form)
    const { control, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm<StoreData>({
        defaultValues: {
            // デフォルト値を設定
            store_name: "",
            address: "",
            business_hours: "",
            regular_holidays: "",
            prior_meal_voucher: false,
            topping_garlic: [],
            topping_vegetable: [],
            topping_oil: [],
            topping_soy_sauce: [],
            noodle_fitness: [],
            is_all_increased: false,
            is_lot: false
        },
        mode: "onBlur"  // フォーカスが外れた時にバリデーションを実行
    })
    const router = useRouter()
    const theme = useTheme()

    // スナックバーの状態管理
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarError, setSnackbarError] = useState(false)
    const [redirectToDetail, setRedirectToDetail] = useState(false)

    // 暫定対応で登録後に詳細画面遷移させるため店舗IDを状態管理
    const [storeId, setStoreId] = useState<string>("")

    // トッピングと麺の選択肢
    const toppingOptions = ["無し", "少なめ", "普通", "ちょいマシ", "マシ", "マシマシ"]
    const noodleOptions = ["柔らかめ", "普通", "硬め", "カタカタ"]

    // トッピングマッピング
    const toppingFieldMap = {
        topping_garlic: "ニンニク",
        topping_vegetable: "野菜",
        topping_oil: "アブラ",
        topping_soy_sauce: "カラメ"
    } as const

    /**
     * フォーム送信時の処理
     * @param data フォームから送信されたデータ
     */
    const onSubmit = async (data: StoreData) => {
        try {
            if (Object.keys(errors).length > 0) {
                setSnackbarMessage("必須項目を入力してください")
                setSnackbarError(true)
                setSnackbarVisible(true)
                return
            }
            // console.log(data)   // デバッグ用ログ出力

            // APIを使用して店舗情報を登録
            const response: StoreApiResponse = await createStore(data)
            console.log("レスポンス情報：", response)
            if (response.data.store.id) {
                setStoreId(response.data.store.id)
            } else {
                setStoreId("2")
            }

            // 成功メッセージを表示
            setSnackbarMessage("店舗情報を登録しました")
            setSnackbarError(false)
            setSnackbarVisible(true)
            setRedirectToDetail(true)
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
        if (redirectToDetail) {
            router.push(`store/detail?id=${storeId}`)
            setRedirectToDetail(false)
        }
    }

    /**
     * チェックボックスの選択状態を更新する関数
     * @param field フォーム内のフィールド名 (StoreDataのキー)
     * @param option 選択されたオプション文字列
     * @param currentValues 現在の選択値の配列
     */
    const handleCheckboxChange = (field: keyof StoreData, option: string, currentValues: string[]) => {
        if (currentValues.includes(option)) {
            // 選択済みの場合は選択を解除
            setValue(field, currentValues.filter(v => v !== option))
        } else {
            // 未選択の場合は追加
            setValue(field, [...currentValues, option])
        }
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
                <Appbar.Header>
                    {/* 戻るボタン */}
                    <Appbar.BackAction onPress={() => router.back()} />
                    {/* 画面タイトル */}
                    <Appbar.Content title="店舗情報登録" />
                    {/* 保存ボタン */}
                    <Appbar.Action
                        icon="content-save"
                        onPress={handleSubmit(onSubmit)}
                    />
                </Appbar.Header>
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
                    {Object.entries(toppingFieldMap).map(([label, fieldName]) => {
                        const currentValues = watch(label as keyof StoreData) as string[] || []
                        return (
                            <View key={label} style={styles.optionContainer}>
                                <Text style={styles.optionLabel}>{fieldName}</Text>
                                <View style={styles.optionGrid}>
                                    {toppingOptions.map((option) => (
                                        <View key={option} style={styles.checkboxContainer}>
                                            <Checkbox.Item
                                                label={option}
                                                status={currentValues.includes(option) ? "checked" : "unchecked"}
                                                onPress={() => handleCheckboxChange(
                                                    label as keyof StoreData,
                                                    option,
                                                    currentValues
                                                )}
                                                style={styles.checkboxItem}
                                                labelStyle={styles.checkboxLabel}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )
                    })}

                    {/* 麺の硬さ選択 */}
                    <View style={styles.optionContainer}>
                        <Text style={styles.optionLabel}>麺の硬さ</Text>
                        <View style={styles.optionGrid}>
                            {noodleOptions.map((option) => {
                                const currentValues = watch("noodle_fitness") as string[] || []
                                return (
                                    <View key={option} style={styles.checkboxContainer} >
                                        <Checkbox.Item
                                            label={option}
                                            status={currentValues.includes(option) ? "checked" : "unchecked"}
                                            onPress={() => handleCheckboxChange(
                                                "noodle_fitness",
                                                option,
                                                currentValues
                                            )}
                                            style={styles.checkboxItem}
                                            labelStyle={styles.checkboxLabel}
                                            mode={Platform.OS === "ios" ? "ios" : "android"}
                                        />
                                    </View>
                                )
                            }
                            )}
                        </View>
                    </View>

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
    }
})