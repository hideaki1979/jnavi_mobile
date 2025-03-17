import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, useTheme, Surface, Divider, Chip, Snackbar } from 'react-native-paper'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { getStoreById } from '@/src/api/storeApi'
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ApiStoreData } from '@/src/types/storeApiResponse'
import LoadingErrorContainer from '@/src/components/feedback/LoadingErrorContainer'
import HeaderAppBar from '@/src/components/navigation/HeaderAppBar'
import { CallOptionData, ToppingData } from '@/src/types/topping'
import { getCallOptions, getToppings } from '@/src/api/toppingApi'

/**
 * 店舗詳細画面コンポーネント
 * 
 * 登録された店舗情報の詳細表示を行う画面
 * @returns 店舗詳細表示コンポーネント
 */

// 整形されたトッピングオプションの型定義
interface FormattedOptions {
    [toppingName: string]: string[] // トッピング名をキーにして、対応するコールオプション名の配列を格納
}

export default function StoreDetails() {
    const theme = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()

    // 店舗データと各種マスタデータの状態管理
    const [storeData, setStoreData] = useState<ApiStoreData | null>(null)
    const [, setToppings] = useState<ToppingData[]>([])
    const [, setCallOptions] = useState<CallOptionData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState(false)

    // 表示用に整形されたデータの状態
    const [formattedOptions, setFormattedOptions] = useState<FormattedOptions>({})
    const [noodleFitnessOptions, setNoodleFitnessOptions] = useState<string[]>([])
    const [noodleAmountOptions, setNoodleAmountOptions] = useState<string[]>([])

    // APIから店舗情報を取得
    useEffect(() => {
        const fetchStoreToppingCallData = async () => {
            try {
                setLoading(true)

                // 店舗情報とコールトッピング情報を並列で取得
                const [storeRes, toppingRes, callOptionRes] =
                    await Promise.all([
                        getStoreById(id),
                        getToppings(),
                        getCallOptions()
                    ])

                console.log("店舗情報取得データ：", JSON.stringify(storeRes, null, 2))

                // 状態管理の更新
                setStoreData(storeRes)
                setToppings(toppingRes)
                setCallOptions(callOptionRes)

                // トッピングデータがある場合は整形する
                // 例：{ "ニンニク": ["抜き", "少なめ", "マシ"], "野菜": ["ちょいマシ", "マシ", "マシマシ"] }
                // （麺の硬さ）["硬め", "カタカタ"]
                // （麺量）["半分", "少なめ"]
                if (storeRes.store_topping_calls && storeRes.store_topping_calls.length > 0) {
                    formatToppingOptions(storeRes, toppingRes, callOptionRes)
                }

            } catch (err) {
                console.error("店舗情報取得処理エラー：", err)
                setError(err instanceof Error ? err.message : "店舗情報取得でエラーが発生しました。")
                setSnackBarVisible(true)
            } finally {
                setLoading(false)
            }
        }
        fetchStoreToppingCallData()
    }, [id])

    /**
     * APIから取得したデータを表示用に整形する
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
        const noodleFitness: string[] = []
        const noodleAmount: string[] = []

        // 各トッピングコールの配列に格納する
        store.store_topping_calls.forEach(call => {
            // トッピングとコールオプションを取得
            const topping = toppings.find(t => t.id === call.topping_id)
            const callOption = callOptions.find(t => t.id === call.call_option_id)

            console.log("トッピング配列情報：", topping)
            console.log("コールオプション配列情報：", callOption)

            if (!topping || !callOption) return

            // 麺の硬さ
            if (topping.id === 5) {
                noodleFitness.push(callOption.call_option_name)
                // 麺量
            } else if (topping.id === 6) {
                noodleAmount.push(callOption.call_option_name)
            } else {
                if (!formatted[topping.topping_name]) {
                    formatted[topping.topping_name] = []
                }
                formatted[topping.topping_name].push(callOption.call_option_name)
            }
            console.log("麺の硬さ配列：", noodleFitness)
            console.log("麺量配列：", noodleAmount)
            console.log("通常トッピング配列：", formatted)
        })

        // 状態を更新
        setFormattedOptions(formatted)
        setNoodleFitnessOptions(noodleFitness)
        setNoodleAmountOptions(noodleAmount)
    }

    // ローディング表示
    if (loading) {
        return <LoadingErrorContainer loading={loading} error={null} />
    }

    // エラーの表示
    if (error || !storeData) {
        return <LoadingErrorContainer loading={false} error={error} />
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={[]}
        >
            <StatusBar style={theme.dark ? "light" : "dark"} />
            <HeaderAppBar showBackButton={true} title='店舗情報詳細' />
            <ScrollView style={styles.container}>
                <Surface style={styles.surface} elevation={2}>
                    {/* タイトル */}
                    <Text
                        variant="headlineSmall"
                        style={styles.title}
                    >
                        {storeData.store_name}
                    </Text>
                    {storeData.branch_name && (
                        <Text
                            variant="titleLarge"
                            style={styles.subtitle}
                        >
                            {storeData.branch_name}
                        </Text>
                    )}

                    {/* 基本情報表示セクション */}
                    <View style={styles.section}>
                        <Text
                            variant='titleMedium'
                            style={styles.sectionTitle}
                        >
                            基本情報
                        </Text>
                        <Divider style={styles.divider} />

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name='map-marker'
                                size={20}
                                color={theme.colors.primary} />
                            <Text style={styles.infoLabel}>
                                住所：
                            </Text>
                            <Text style={styles.infoValue}>
                                {storeData.address}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name='map-clock'
                                size={20}
                                color={theme.colors.primary} />
                            <Text style={styles.infoLabel}>
                                営業時間：
                            </Text>
                            <Text style={styles.infoValue}>
                                {storeData.business_hours}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="calendar"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>
                                定休日：
                            </Text>
                            <Text style={styles.infoValue}>
                                {storeData.regular_holidays}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="ticket-confirmation"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>事前食券有無：</Text>
                            <Text style={styles.infoValue}>
                                {storeData.prior_meal_voucher ? "あり" : "なし"}
                            </Text>
                        </View>
                    </View>
                    {/* トッピングオプションセクション - 店舗オプションを表示 */}
                    <View style={styles.section}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            トッピングオプション
                        </Text>
                        <Divider style={styles.divider} />
                        {/* ニンニク、野菜、アブラ、カラメのオプション表示 */}
                        {Object.entries(formattedOptions).map(([toppingName, options]: [string, string[]]) => (
                            <View key={toppingName} style={styles.toppingCategory}>
                                <Text style={styles.toppingLabel}>
                                    {toppingName}：
                                </Text>
                                <View style={styles.chipContainer}>
                                    {options.map((option: string, index: number) => (
                                        <Chip
                                            key={index}
                                            style={styles.chip}
                                            textStyle={styles.chipText}
                                            mode='outlined'>
                                            {option}
                                        </Chip>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* 麺の硬さオプション表示 */}
                    {noodleFitnessOptions.length > 0 && (
                        <View style={styles.toppingCategory}>
                            <Text style={styles.toppingLabel}>麺の硬さ：</Text>
                            <View style={styles.chipContainer}>
                                {noodleFitnessOptions.map((option, index) => (
                                    <Chip
                                        key={index}
                                        style={styles.chip}
                                        textStyle={styles.chipText}
                                        mode='outlined'>
                                        {option}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* 麺量オプション表示 */}
                    {noodleAmountOptions.length > 0 && (
                        <View style={styles.toppingCategory}>
                            <Text style={styles.toppingLabel}>麺量：</Text>
                            <View style={styles.chipContainer}>
                                {noodleAmountOptions.map((option, index) => (
                                    <Chip
                                        key={index}
                                        style={styles.chip}
                                        textStyle={styles.chipText}
                                        mode='outlined'>
                                        {option}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* トッピングコール補足情報表示 */}
                    <View style={styles.section}>
                        <Text
                            variant='titleMedium'
                            style={styles.sectionTitle}
                        >
                            コールトッピング補足情報
                        </Text>
                        <Divider style={styles.divider} />

                        <View style={styles.detailSection}>
                            <View style={styles.detailHeader}>
                                <FontAwesome6
                                    name="bowl-food"
                                    size={20}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.infoLabel}>トッピング詳細：</Text>
                            </View>
                            <Text style={styles.detailText}>
                                {storeData.topping_details}
                            </Text>
                        </View>

                        <View style={styles.detailSection}>
                            <View style={styles.detailHeader}>
                                <MaterialCommunityIcons
                                    name='microphone'
                                    size={20}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.infoLabel}>コール詳細：</Text>
                            </View>
                            <Text style={styles.detailText}>
                                {storeData.call_details}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name='arrow-up-bold'
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>全マシ有無</Text>
                            <Text style={styles.infoValue}>
                                {storeData.is_all_increased ? "あり" : "なし"}
                            </Text>
                        </View>
                    </View>

                    {/* ロット情報セクション */}
                    <View style={styles.section}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            ロット情報
                        </Text>
                        <Divider style={styles.divider} />
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name='account-group'
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>ロット制有無：</Text>
                            <Text style={styles.infoValue}>
                                {storeData.is_lot ? 'あり' : 'なし'}
                            </Text>
                        </View>
                        {storeData.is_lot && (
                            <View style={styles.detailSection}>
                                <View style={styles.detailHeader}>
                                    <MaterialCommunityIcons
                                        name='information'
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.infoLabel}>ロット詳細</Text>
                                </View>
                                <Text style={styles.detailText}>
                                    {storeData.lot_detail}
                                </Text>
                            </View>
                        )}
                    </View>
                </Surface>
            </ScrollView>
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                style={{ backgroundColor: error ? theme.colors.error : theme.colors.primary }}
            >
                {error}
            </Snackbar>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20

    },
    loadingText: {
        marginVertical: 16,
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        marginVertical: 16,
        alignItems: 'center'
    },
    surface: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 32
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8
    },
    subtitle: {
        marginBottom: 8
    },
    section: {
        marginVertical: 8
    },
    sectionTitle: {
        fontWeight: "bold"
    },
    divider: {
        marginBottom: 16
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        flexWrap: "wrap"
    },
    infoLabel: {
        fontWeight: "bold",
        marginHorizontal: 8
    },
    infoValue: {
        flex: 1
    },
    toppingCategory: {
        marginBottom: 16
    },
    toppingLabel: {
        fontWeight: "bold",
        marginBottom: 8
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    chip: {
        margin: 4
    },
    chipText: {
        fontSize: 10
    },
    detailSection: {
        marginBottom: 16
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },
    detailText: {
        paddingLeft: 28,
        lineHeight: 20
    }
})
