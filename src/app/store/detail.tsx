import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, Button, useTheme, ActivityIndicator, Surface, Appbar, Divider, Chip, Snackbar } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { StoreData } from '@/src/types/store'
import { getStoreById } from '@/src/api/api'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

/**
 * 店舗詳細画面コンポーネント
 * 
 * 登録された店舗情報の詳細表示を行う画面
 * @returns 店舗詳細表示コンポーネント
 */
export default function StoreDetails() {
    const router = useRouter()
    const theme = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()

    // 店舗データの状態管理
    const [storeData, setStoreData] = useState<StoreData | null>(null)
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
                const toppingMockRamenData = {
                    ...data,
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
            const array = storeData[key as keyof StoreData] as string[] | undefined
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
                <Text>Loading.....</Text>
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
                        variant="headlineMedium"
                        style={styles.title}
                    >
                        {storeData.store_name}
                    </Text>
                    {storeData.branch_name && (
                        <Text
                            variant='titleMedium'
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
                                営業時間：
                            </Text>
                            <Text style={styles.infoValue}>
                                {storeData.business_hours}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="clock"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>
                                定休日
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
                                        <Chip key={index} style={styles.chip} mode='outlined'>
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
                                <Chip key={index} style={styles.chip} mode='outlined'>
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

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name="food"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>トッピング詳細：</Text>
                            <Text style={styles.infoValue}>
                                {storeData.topping_details}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons
                                name='microphone'
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.infoLabel}>コール詳細：</Text>
                            <Text style={styles.infoValue}>
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
                        <Text variant='labelMedium' style={styles.section}>
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
                            {storeData.is_lot && (
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons
                                        name='information'
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.infoLabel}>ロット詳細</Text>
                                    <Text style={styles.infoValue}>
                                        {storeData.lot_detail}
                                    </Text>
                                </View>
                            )}
                        </View>
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

    },
    loadingContainer: {

    },
    errorContainer: {

    },
    errorText: {

    },
    surface: {

    },
    title: {

    },
    subtitle: {

    },
    section: {

    },
    sectionTitle: {

    },
    divider: {

    },
    infoRow: {

    },
    infoLabel: {

    },
    infoValue: {

    },
    toppingCategory: {

    },
    toppingLabel: {

    },
    chipContainer: {

    },
    chip: {

    },
    chipText: {

    },
    noData: {

    },
    backButton: {

    }
})
