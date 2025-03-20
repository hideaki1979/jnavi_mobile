import { router } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Button, Card, Checkbox, Text, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import finishMealImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import { StatusBar } from "expo-status-bar"


export default function AfterFinish() {
    const theme = useTheme()
    const finishMealImage = Asset.fromModule(finishMealImageSource)

    // チェックボックスの状態管理
    const [checkedItem, setCheckedItem] = useState({
        bowl: false,
        tissue: false,
        wipe: false,
        nothing: false
    })

    // チェックボックス用ハンドラー
    const handleCheckboxChenged = (name: string) => {
        setCheckedItem((prev) => ({
            ...prev,
            [name]: !prev[name as keyof typeof prev]
        }))
    }

    // 回答ページに画面遷移
    const handleNextPage = () => {
        let resultText = ""
        if (checkedItem.bowl && checkedItem.tissue &&
            checkedItem.wipe && !checkedItem.nothing) {
            resultText = "正解"
        } else {
            resultText = "不正解"
        }

        router.push({
            pathname: `simulation/answer`,
            params: { resultText }
        })
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* ヘッダー */}
            <HeaderAppBar showBackButton={true} title="コールシミュレーション" />

            {/* メインコンテンツ */}
            <ScrollView style={styles.content}>
                <Card style={styles.cardContainer}>
                    <Card.Cover
                        source={{ uri: finishMealImage.uri }}
                    />
                </Card>

                <Text style={styles.textQuestion}>
                    ラーメンを完食しました。{"\n"}
                    退店時にあなたはすぐに帰りますか？
                </Text>

                <View style={styles.checkboxContainer}>
                    <Checkbox.Item
                        label="どんぶりをカウンターにあげる"
                        status={checkedItem.bowl ? "checked" : "unchecked"}
                        onPress={() => { handleCheckboxChenged('bowl') }}
                        labelStyle={{ fontSize: 14 }}
                    />
                    <Checkbox.Item
                        label="ティッシュをゴミ箱に捨てる"
                        status={checkedItem.tissue ? "checked" : "unchecked"}
                        onPress={() => { handleCheckboxChenged('tissue') }}
                        labelStyle={{ fontSize: 14 }}
                    />
                    <Checkbox.Item
                        label="テーブルを雑巾で拭く"
                        status={checkedItem.wipe ? "checked" : "unchecked"}
                        onPress={() => { handleCheckboxChenged('wipe') }}
                        labelStyle={{ fontSize: 14 }}
                    />
                    <Checkbox.Item
                        label="何もせずに退店する"
                        status={checkedItem.nothing ? "checked" : "unchecked"}
                        onPress={() => { handleCheckboxChenged('nothing') }}
                        labelStyle={{ fontSize: 14 }}
                    />
                </View>
                <Button
                    mode="contained"
                    onPress={handleNextPage}
                    style={styles.nextButton}
                >
                    回答を見る
                </Button>
            </ScrollView>
            {/* フッター */}
            <BottomAppBar showRoutes={["map", "create"]} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1,
        padding: 16
    },
    cardContainer: {
        marginBottom: 24
    },
    textQuestion: {
        lineHeight: 32,
        marginBottom: 24
    },
    checkboxContainer: {
        borderWidth: 2,
        borderStyle: "dotted",
        padding: 8,
        marginBottom: 32
    },
    nextButton: {
        width: "50%",
        alignSelf: "center"
    }
})