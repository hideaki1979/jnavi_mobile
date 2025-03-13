import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View } from "react-native"
import { Appbar, Button, Card, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"


type Ticket = {
    id: number;
    menu_name: string;
    price: number;
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

    const handlePressTicket = () => {
        router.push(`simulation/precall`)
    }

    return (
        <SafeAreaView edges={[]} style={styles.container} >
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* ヘッダー */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content
                    title="コールシミュレーション"
                />
            </Appbar.Header>

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

            {/* フッター */}
            <Appbar style={styles.bottomBar}>
                <Appbar.Action icon="map" onPress={() => { router.push(`store/map`) }} />
                <Appbar.Action icon="home" onPress={() => { }} />
                <Appbar.Action icon="plus-box"
                    onPress={() => { router.push(`store/create`) }} />
                <Appbar.Action
                    icon="tune-vertical"
                    onPress={() => { router.push(`simulation/ticket_machine`) }} />
                <Appbar.Action icon="account" onPress={() => { }} />
            </Appbar>

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

    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})

