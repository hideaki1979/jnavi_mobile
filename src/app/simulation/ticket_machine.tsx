import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Button, Card, Snackbar, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Dropdown } from 'react-native-element-dropdown'
import { useEffect, useState } from "react"
import LoadingErrorContainer from '@/src/components/feedback/LoadingErrorContainer'
import { getStoresAll } from '@/src/api/storeApi'
import { MaterialCommunityIcons } from "@expo/vector-icons"


// チケットのデータ型
type Ticket = {
    id: number;
    menu_name: string;
    price: number;
}

type ShopItem = {
    label: string;
    value: string | number;
}

const Tickets: Ticket[] = [
    { id: 1, menu_name: '小ラーメン', price: 600 },
    { id: 2, menu_name: '小豚入り', price: 700 },
    { id: 3, menu_name: '小W豚入り', price: 800 },
    { id: 4, menu_name: '大ラーメン', price: 700 },
    { id: 5, menu_name: '大豚入り', price: 800 },
    { id: 6, menu_name: '大W豚入り', price: 900 }
]

export default function TicketMachine() {

    const theme = useTheme()
    const [selectedShop, setSelectedShop] = useState<string>("")
    const [isFocus, setIsFocus] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [stores, setStores] = useState<ShopItem[]>([])
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)


    useEffect(() => {
        const fetchStoresData = async () => {
            try {
                const storesData = await getStoresAll()
                const dropdownItems: ShopItem[] = storesData.map(store => ({
                    label: `${store.store_name} ${store.branch_name || ''}`,
                    value: store.id
                }))
                setStores(dropdownItems)
            } catch (error) {
                console.error("店舗情報取得エラー:", error)
                setError("店舗情報の取得に失敗しました")
            } finally {
                setLoading(false)
            }
        }
        fetchStoresData()
    }, [])

    const handlePressTicket = () => {
        if (!selectedShop) {
            setError("店舗を選択してください")
            setSnackBarVisible(true)
            return
        }
        router.push({
            pathname: `simulation/precall`,
            params: { id: selectedShop }
        })
    }
    // ローディング表示
    if (loading) {
        return <LoadingErrorContainer loading={loading} error={null} />
    }

    const renderItem = (item: ShopItem) => {
        return (
            <View style={styles.dropdownItem}>
                <Text
                    style={styles.dropdownText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >{item.label}</Text>
            </View>
        )
    }

    const renderLeftIcon = () => {
        return (
            <MaterialCommunityIcons
                name="noodles"
                size={20}
                color={theme.colors.primary}
                style={styles.icon}
            />
        )
    }

    return (
        <SafeAreaView edges={[]} style={styles.container} >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 32} // iOSでオフセットを追加
            >

                <StatusBar style={theme.dark ? "light" : "dark"} />
                {/* ヘッダー */}
                <HeaderAppBar showBackButton={true} title="コールシミュレーション" />

                <View style={styles.shopSelectorContainer}>
                    <Dropdown
                        style={[styles.dropdown, isFocus && {
                            borderColor: theme.colors.primary
                        }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={stores}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? "店舗を選択してください。" : "....."}
                        searchPlaceholder="キーワード検索"
                        value={selectedShop}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            setSelectedShop(item.value)
                            setIsFocus(false)
                        }}
                        renderItem={renderItem}
                        renderLeftIcon={renderLeftIcon}
                    />
                </View>

                {/* 券売機 */}
                <View style={styles.ticketMachineContainer}>
                    <View style={styles.ticketMachine}>
                        {Tickets.map((ticket) => (
                            <Card
                                key={ticket.id}
                                elevation={2}
                                style={styles.ticketCard}
                            >
                                <Card.Content style={styles.cardContent}>
                                    <Text style={styles.cardText}>
                                        {ticket.menu_name}
                                    </Text>
                                </Card.Content>
                                <Card.Actions style={styles.cardAction}>
                                    <Button
                                        mode="contained"
                                        onPress={() => handlePressTicket()}
                                    >
                                        ¥{ticket.price}
                                    </Button>
                                </Card.Actions>
                            </Card>
                        ))}
                    </View>
                    <View style={styles.instructionContainer}>
                        <Text style={styles.instructionText}>あなたは券売機の前にいます。</Text>
                        <Text style={styles.instructionText}>食べたいメニューを選んでください。</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* フッター */}
            <BottomAppBar showRoutes={['map', 'create']} />

            {/* エラー表示用スナックバー */}
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                style={{ backgroundColor: theme.colors.error }}
            >
                {error}
            </Snackbar>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    ticketMachineContainer: {
        flex: 1,
        padding: 16
    },
    ticketMachine: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center"
    },
    ticketCard: {
        width: "40%",
        margin: 8,
        alignItems: "center"
    },
    cardContent: {
        alignItems: "center"
    },
    cardText: {
        fontSize: 14,
        fontWeight: "bold"
    },
    cardAction: {
        justifyContent: "center",
        paddingBottom: 16

    },
    instructionContainer: {
        padding: 32
    },
    instructionText: {
        lineHeight: 24
    },
    shopSelectorContainer: {
        padding: 8
    },
    dropdown: {
        padding: 16,
        borderColor: "#c7c7c7",
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 12
    },
    dropdownItem: {
        padding: 8
    },
    dropdownText: {
        flex: 1,
        fontSize: 12
    },
    icon: {
        marginRight: 8
    },
    placeholderStyle: {
        fontSize: 16
    },
    selectedTextStyle: {
        fontSize: 16
    },
    iconStyle: {
        width: 24,
        height: 24
    },
    inputSearchStyle: {
        fontSize: 12
    }
})