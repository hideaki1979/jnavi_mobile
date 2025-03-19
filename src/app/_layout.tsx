import { Stack } from 'expo-router'
import { StyleSheet, useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import lightTheme, { darkTheme } from '../styles/theme'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Layout = () => {
    // システムの色設定を取得（ダークモード対応の場合）
    const colorScheme = useColorScheme()

    // システムの設定に基づいてテーマを選択
    const theme = colorScheme === "dark" ? darkTheme : lightTheme

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <PaperProvider theme={theme}>
                    <Stack screenOptions={{ headerShown: false }} />
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default Layout