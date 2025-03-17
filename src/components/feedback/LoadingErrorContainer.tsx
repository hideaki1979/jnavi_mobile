import { StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { router } from "expo-router"

type LoadingErrorContainerProps = {
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
}

/**
 * ローディングとエラー表示の共通コンポーネント
 */
export default function LoadingErrorContainer({
    loading,
    error,
    onRetry
}: LoadingErrorContainerProps) {
    const theme = useTheme()

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
                <Text style={[styles.text, { color: theme.colors.primary }]}>
                    Loading...
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
                <Text style={styles.text}>{error}</Text>
                {onRetry ? (
                    <Button mode="contained" onPress={onRetry}>
                        再試行
                    </Button>
                ) : (
                    <Button mode="contained" onPress={() => router.back()}>
                        戻る
                    </Button>
                )}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16
    },
    text: {
        marginVertical: 16,
        alignItems: "center"
    },
    errorText: {
        marginVertical: 16,
        alignItems: "center"
    }
})