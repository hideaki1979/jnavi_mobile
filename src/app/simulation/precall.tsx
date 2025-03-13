import { router } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Appbar, Button, Card, RadioButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import preCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'


export default function PreCall() {

    const preCallImage = Asset.fromModule(preCallImageSource)

    // ラジオボタンの選択状態を管理
    const [noodleHardness, setNoodleHardness] = useState<string>('')
    const [backFat, setBackFat] = useState<string>('')
    const [noodleAmount, setNoodleAmount] = useState<string>('')

    const handleCallOption = () => {
        let callText = ""

        // 麺の硬さが選択されている場合
        if (noodleHardness) {
            callText += `麺${noodleHardness}`
        }

        // 麺量が選択されている場合
        if (noodleAmount) {
            if (callText) {
                callText += `\n`
            } else {
                callText += `麺`
            }
            callText += `${noodleAmount}`
        }

        // アブラが選択されている場合
        if (backFat) {
            if (callText) callText += `\n`
            callText += `アブラ${backFat}`
        }

        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/precall_result`,
            params: { callText }
        })
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => { router.back() }} />
                <Appbar.Content
                    title="コールシミュレーション"
                    titleStyle={{ fontSize: 16, fontWeight: "bold" }}
                />
            </Appbar.Header>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}>
                <Card style={styles.cardContainer}>
                    <Card.Cover
                        source={{ uri: preCallImage.uri }}
                    />
                </Card>
                <Text style={styles.description}>
                    行列に並んでいると、店員さんから{'\n'}
                    食券を見せてください」と言われました。{'\n'}
                    食券を見せると同時に、{'\n'}
                    事前コールしたいオプションを選択しましょう。
                </Text>

                {/* 麺の硬さ */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>麺の硬さ</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setNoodleHardness(value)}
                        value={noodleHardness}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="柔らかめ" value="柔らかめ" labelVariant="labelLarge" />
                            <RadioButton.Item label="硬め" value="硬め" labelVariant="labelLarge" />
                            <RadioButton.Item label="カタカタ" value="カタカタ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* アブラ */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>アブラ</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setBackFat(value)}
                        value={backFat}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="抜き" value="抜き" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* 麺量 */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>麺量</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setNoodleAmount(value)}
                        value={noodleAmount}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="半分" value="半分" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* コールボタン */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={() => { router.push(`simulation/postcall`) }}
                    >
                        コール無し
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleCallOption}
                    >
                        コール有り
                    </Button>
                </View>


            </ScrollView>

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
    scrollContainer: {
        flex: 1,
        padding: 16
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 24

    },
    cardContainer: {
        marginBottom: 16
    },
    description: {
        lineHeight: 24,
        marginBottom: 24
    },
    radioGroup: {
        marginBottom: 16
    },
    radioLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: "bold"
    },
    radioItemGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,    // ネガティブマージンでグリッドの位置調整し、横スクロールを防ぐ
        paddingHorizontal: 8
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 16
    },
    bottomBar: {
        justifyContent: "space-evenly"
    }
})