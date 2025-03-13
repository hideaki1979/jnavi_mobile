import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, Button, useTheme, ActivityIndicator, Surface, Appbar, Divider, Chip, Snackbar } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { getStoreById } from '@/src/api/api'
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ApiStoreData } from '@/src/types/storeApiResponse'

/**
 * 店舗詳細画面コンポーネント
 * 
 * 登録された店舗情報の詳細表示を行う画面
 * @returns 店舗詳細表示コンポーネント
 */

// 店舗詳細画面用型定義
interface StoreDetail extends ApiStoreData {
    // トッピングオプション（モックデータ含む）
    topping_garlic: string[];
    topping_vegetable: string[];
    topping_oil: string[];
    topping_soy_sauce: string[];
    noodle_fitness: string[];
}


export default function StoreDetails() {
    const router = useRouter()
    const theme = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()

    // 店舗データの状態管理
    const [storeData, setStoreData] = useState<StoreDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState(false)

    // トッピング情報モックデータ（DBを実装までの暫定）
    const mockToppingOptions = {
        topping_garlic: ['なし', '少なめ', '普通', 'マシ', 'マシマシ'],
        topping_vegetable: ["なし", "少なめ", "普通", "マシ", "マシマシ"],
        topping_oil: ["なし", "少なめ", "普通", "マシ", "マシマシ"],
        topping_soy_sauce: ["なし", "少なめ", "普通", "マシ"],
        noodle_fitness: ["柔らかめ", "普通", "硬め", "カタカタ"]
    }

    // APIから店舗情報を取得
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const data = await getStoreById(id)
                // console.log("店舗情報取得データ：", data)
                const store = data.data
                const toppingMockRamenData: StoreDetail = {
                    ...store,
                    topping_garlic: mockToppingOptions.topping_garlic,
                    topping_vegetable: mockToppingOptions.topping_vegetable,
                    topping_oil: mockToppingOptions.topping_oil,
                    topping_soy_sauce: mockToppingOptions.topping_soy_sauce,
                    noodle_fitness: mockToppingOptions.noodle_fitness
                }
                setStoreData(toppingMockRamenData)
            } catch (err) {
                console.error("店舗情報取得処理エラー：", err)
                setError(err instanceof Error ? err.message : "店舗情報取得でエラーが発生しました。")
                setSnackBarVisible(true)
            } finally {
                setLoading(false)
            }
        }
        fetchStoreData()
    }, [id])

    // トッピングオプションの全てを取得する関数
    const getAllToppingOptions = () => {
        if (!storeData) return {}

        const toppingMap = {
            "topping_garlic": "ニンニク",
            "topping_vegetable": "野菜",
            "topping_oil": "アブラ",
            "topping_soy_sauce": "カラメ"
        } as const

        const result: Record<string, string[]> = {}

        Object.entries(toppingMap).forEach(([key, label]) => {
            const array = storeData[key as keyof StoreDetail] as string[] | undefined
            if (array && array.length > 0) {
                result[label] = array
            }
        })

        return result
    }

    // ローディング表示
    if (loading) {
        return (
            <View style={styles.errorContainer}>
                <ActivityIndicator animating={true} size="large" />
                <Text style={styles.loadingText}>Loading.....</Text>
            </View>
        )
    }

    // エラーの表示
    if (error || !storeData) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>店舗情報を取得出来ません！</Text>
                <Button mode='contained' onPress={() => router.back()}>
                    戻る
                </Button>
            </View>
        )
    }

    // トッピングオプションを取得
    const toppingOptions = getAllToppingOptions()

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={[]}
        >
            <StatusBar style={theme.dark ? "light" : "dark"} />
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="店舗情報詳細" />
            </Appbar.Header>
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
                        {Object.entries(toppingOptions).map(([category, options]: [string, string[]]) => (
                            <View key={category} style={styles.toppingCategory}>
                                <Text style={styles.toppingLabel}>
                                    {category}：
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
                    <View style={styles.toppingCategory}>
                        <Text style={styles.toppingLabel}>麺の硬さ：</Text>
                        <View style={styles.chipContainer}>
                            {storeData.noodle_fitness.map((option, index) => (
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
        marginBottom: 8
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
