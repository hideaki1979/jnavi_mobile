import { router } from "expo-router"
import { StyleSheet } from "react-native"
import { Appbar } from "react-native-paper"

type RouteType = 'map' | 'home' | 'create' | 'simulation' | 'account'

type BottomAppBarProps = {
    // 現在アクティブなルート（複数指定可能）
    activeRoutes?: RouteType[];
    // 特定のルートを非表示にする場合に使用する（複数指定可能）
    showRoutes?: RouteType[];
}

/**
 * アプリ全体で使用する共通のボトムナビゲーションバー
 */
export default function BottomAppBar({ activeRoutes = [], showRoutes = [] }: BottomAppBarProps) {

    // ルートが非活性かを判定する
    const isDisbled = (route: RouteType) => activeRoutes.includes(route)
    const shouldShowRoute = (route: RouteType) => showRoutes.includes(route)

    return (
        <Appbar style={styles.appBar}>
            {shouldShowRoute('map') && (
                <Appbar.Action
                    icon="map"
                    onPress={() => { router.push(`store/map`) }}
                    disabled={isDisbled('map')}
                />
            )}

            {shouldShowRoute('home') && (
                <Appbar.Action
                    icon="home"
                    onPress={() => { }}
                    disabled={isDisbled('home')}
                />
            )}

            {shouldShowRoute('create') && (
                <Appbar.Action
                    icon="plus-circle"
                    onPress={() => { router.push(`store/create`) }}
                    disabled={isDisbled('create')}
                />
            )}

            {shouldShowRoute('simulation') && (
                <Appbar.Action
                    icon="chart-line"
                    onPress={() => { router.push(`simulation/ticket_machine`) }}
                    disabled={isDisbled('simulation')}
                />
            )}

            {shouldShowRoute('account') && (
                <Appbar.Action
                    icon="account"
                    onPress={() => { }}
                    disabled={isDisbled('simulation')}
                />
            )}
        </Appbar>
    )
}

const styles = StyleSheet.create({
    appBar: {
        justifyContent: 'space-evenly'
    }
})