import { ScrollView, StyleSheet, View } from 'react-native'
import { Text, useTheme, Surface, Divider, Snackbar, List } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { getStoreById } from '@/src/api/storeApi'
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { FormattedToppingOptionNameStoreData } from '@/src/types/storeApiResponse'
import LoadingErrorContainer from '@/src/components/feedback/LoadingErrorContainer'
import HeaderAppBar from '@/src/components/navigation/HeaderAppBar'
import { FormattedToppingOptionNames } from '@/src/types/topping'
import ToppingOptionsAccordion from '@/src/components/store/ToppingOptionsAccordion'

/**
 * 店舗詳細画面コンポーネント
 * 
 * 登録された店舗情報の詳細表示を行う画面
 * @returns 店舗詳細表示コンポーネント
 */
export default function StoreDetails() {
    const theme = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()

    // 店舗データと各種マスタデータの状態管理
    const [storeData, setStoreData] = useState<FormattedToppingOptionNameStoreData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState(false)

    // 表示用に整形されたデータの状態
    const [formattedPreOptions, setFormattedPreOptions] = useState<FormattedToppingOptionNames>({})
    const [formattedPostOptions, setFormattedPostOptions] = useState<FormattedToppingOptionNames>({})

    // アコーディオンの展開状態管理
    const [preExpanded, setPreExpanded] = useState<boolean>(true)
    const [postExpanded, setPostExpanded] = useState<boolean>(true)

    // APIから店舗情報を取得
    useEffect(() => {
        /**
         * 店舗情報、トッピング情報、コールオプション情報を並列で取得し状態管理を更新
         * 
         * APIから店舗情報、トッピング情報、コールオプション情報を取得し状態管理を更新
         * トッピング情報がある場合は、店舗情報に含まれるコールトッピング情報を整形して状態管理に反映
         * 
         * @throws {Error} APIから取得したデータの整形中にエラーが発生した場合
         */
        const fetchStoreToppingCallData = async () => {
            try {
                // 店舗情報を取得（整形済みトッピング情報を含む）
                const storeRes = await getStoreById(id)
                // console.log("店舗情報取得データ：", JSON.stringify(storeRes, null, 2))

                // 状態管理の更新
                setStoreData(storeRes)
                // APIから直接整形済みデータを使用
                setFormattedPreOptions(storeRes.preCallFormatted)
                setFormattedPostOptions(storeRes.postCallFormatted)
                // console.log("preCallFormatted：", JSON.stringify(storeRes.preCallFormatted, null, 2))
                // console.log("postCallFormatted：", JSON.stringify(storeRes.postCallFormatted, null, 2))

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
            <HeaderAppBar
                showBackButton={true}
                title='店舗情報詳細'
                rightAction={{
                    icon: 'image',
                    onPress: () => {
                        router.push({
                            pathname: `/store/image_upload`,
                            params: { id: String(storeData.id) }
                        }
                        )

                    }
                }}
            />
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
                        {/* ニンニク、野菜、アブラ、カラメなどのコールオプション表示（事前コール） */}
                        <ToppingOptionsAccordion
                            title="事前トッピングコール情報"
                            expanded={preExpanded}
                            onPress={() => setPreExpanded(!preExpanded)}
                            options={formattedPreOptions}
                            leftIcon={<List.Icon icon="clipboard-outline" />}
                        />

                        {/* ニンニク、野菜、アブラ、カラメなどのコールオプション表示（着丼前コール） */}
                        <ToppingOptionsAccordion
                            title="着丼前トッピングコール情報"
                            expanded={postExpanded}
                            onPress={() => setPostExpanded(!postExpanded)}
                            options={formattedPostOptions}
                            leftIcon={
                                <List.Icon
                                    icon={({ size, color }) => (
                                        <FontAwesome6 size={size} color={color} name="bowl-food" />
                                    )}
                                />
                            }
                        />
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
