import { router } from "expo-router"
import { StyleSheet } from "react-native"
import { Appbar, Text } from "react-native-paper"
import { View } from "react-native"
import { useAuth } from "@/src/app/context/AuthProvider"
import { type RouteType } from "@/src/types/routeType"

type BottomAppBarProps = {
    // 特定のルートを表示したい場合に使用する（複数指定可能）
    showRoutes?: RouteType[];
}

/**
 * アプリ全体で使用する共通のボトムナビゲーションバー
 */
export default function BottomAppBar({ showRoutes = [] }: BottomAppBarProps) {

    // 親コンポーネントから指定されたルートを表示する。
    const shouldShowRoute = (route: RouteType) => showRoutes.includes(route)

    const { signOut } = useAuth()

    return (
        <Appbar style={styles.appBar}>
            {shouldShowRoute('map') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="map"
                            onPress={() => { router.push(`store/map`) }}
                        />
                        <Text style={styles.appText}>map</Text>
                    </View>
                </>
            )}

            {shouldShowRoute('home') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="home"
                            onPress={() => { router.push('test/maptest') }}
                        />
                        <Text style={styles.appText}>home</Text>
                    </View>
                </>
            )}

            {shouldShowRoute('create') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="plus-circle"
                            onPress={() => { router.push(`store/create`) }}
                        />
                        <Text style={styles.appText}>register</Text>
                    </View>
                </>
            )}

            {shouldShowRoute('simulation') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="chart-line"
                            onPress={() => { router.push(`simulation/ticket_machine`) }}
                        />
                        <Text style={styles.appText}>simulation</Text>
                    </View>
                </>
            )}

            {shouldShowRoute('account') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="account"
                            onPress={() => { router.push('auth/signin') }}
                        />
                        <Text style={styles.appText}>account</Text>
                    </View>
                </>
            )}

            {shouldShowRoute('logout') && (
                <>
                    <View style={styles.appMenu}>
                        <Appbar.Action
                            icon="logout"
                            onPress={async () => {
                                await signOut()
                            }}
                        />
                        <Text style={styles.appText}>logout</Text>
                    </View>
                </>
            )}

        </Appbar>
    )
}

const styles = StyleSheet.create({
    appBar: {
        justifyContent: 'space-evenly'
    },
    appMenu: {
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    appText: {
        marginTop: -16
    }
})