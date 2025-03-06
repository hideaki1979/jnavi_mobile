import {
    View, ScrollView, Platform, KeyboardAvoidingView, StyleSheet, Keyboard
} from "react-native"
import { Text, TextInput, Button, Checkbox, Appbar, useTheme, Switch } from "react-native-paper"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"

/**
 * 店舗情報登録画面コンポーネント
 * 
 * 新規店舗情報の入力と登録を行う画面
 * React Hook Formを使用してフォーム入力を管理
 * @returns 店舗情報登録フォームコンポーネント
 */
export default function StoreCreate() {
    // フォームの状態管理 (React Hook Form)
    const { control, handleSubmit, watch, setValue } = useForm<FormData>({
        defaultValues: {
            // デフォルト値を設定
            prior_meal_voucher: false,
            topping_garlic: [],
            topping_vegetable: [],
            topping_oil: [],
            topping_soy_sauce: [],
            noodle_fitness: [],
            is_all_increased: false,
            is_lot: false
        }
    })
    const router = useRouter()
    const theme = useTheme()

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
     * フォームデータの型定義
     */
    type FormData = {
        // 店舗基本情報
        store_name: string;
        branch_name: string;
        address: string;
        business_hours: string;
        regular_holidays: string;

        // 事前食券購入有無
        prior_meal_voucher: boolean;

        // トッピングコール詳細
        topping_garlic: string[];
        topping_vegetable: string[];
        topping_oil: string[];
        topping_soy_sauce: string[];

        // 麺の硬さ
        noodle_fitness: string[];

        // トッピングコール補足
        topping_details: string;
        call_details: string;

        // 全体増量の有無
        is_all_increased: boolean;

        // ロット制の有無
        is_lot: boolean;
        lot_detail: string;
    }

    /**
     * フォーム送信時の処理
     * @param data フォームから送信されたデータ
     */
    const onSubmit = (data: FormData) => {
        console.log(data)   // デバッグ用ログ出力
        router.push("/store/detail")    // 暫定で詳細画面遷移。実際はAPI送信処理を実装
    }

    // チェックボックスの選択状態を更新する関数
    const handleCheckboxChange = (field: keyof FormData, option: string, currentValues: string[]) => {
        if (currentValues.includes(option)) {
            // 選択済みの場合は選択を解除
            setValue(field, currentValues.filter(v => v !== option))
        } else {
            // 未選択の場合は追加
            setValue(field, [...currentValues, option])
        }
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={[]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 24} // iOSでオフセットを追加
            >
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => router.back()} />
                    <Appbar.Content title="店舗情報登録" />
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
                        render={({ field }) => (
                            <TextInput
                                label="店舗名"
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={() => Keyboard.dismiss()} // フォーカス外れたらキーボードを閉じる
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="branch_name"
                        render={({ field }) => (
                            <TextInput label="支店名" value={field.value} onChangeText={field.onChange} />
                        )}
                    />
                    <Controller
                        control={control}
                        name="address"
                        render={({ field }) => (
                            <TextInput label="住所" value={field.value} onChangeText={field.onChange} />
                        )}
                    />
                    <Controller
                        control={control}
                        name="business_hours"
                        render={({ field }) => (
                            <TextInput label="営業時間" value={field.value} onChangeText={field.onChange} />
                        )}
                    />
                    <Controller
                        control={control}
                        name="regular_holidays"
                        render={({ field }) => (
                            <TextInput label="定休日" value={field.value} onChangeText={field.onChange} />
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
                        const currentValues = watch(label as keyof FormData) as string[] || []
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
                                                    label as keyof FormData,
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
                            <TextInput label="トッピング詳細" value={field.value} onChangeText={field.onChange} />
                        )}
                    />

                    <Controller
                        control={control}
                        name="call_details"
                        render={({ field }) => (
                            <TextInput label="コール詳細" value={field.value} onChangeText={field.onChange} />
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
                            <TextInput label="ロット詳細" value={field.value} onChangeText={field.onChange} />
                        )}
                    />
                    {/* 登録ボタン */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={{ marginTop: 16 }}
                    >
                        登録
                    </Button>
                </ScrollView>
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