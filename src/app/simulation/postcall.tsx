import { router } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { Appbar, Button, Card, RadioButton, Text } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { Asset } from 'expo-asset'
import postCallImageSource from '../../../public/images/jiro_counter2_manga_final.jpg'


export default function PostCall() {

    const postCallImage = Asset.fromModule(postCallImageSource)

    // ラジオボタンの選択状態を管理
    const [vegetablesVolume, setVegetablesVolume] = useState<string>('')
    const [garlicVolume, setGarlicVolume] = useState<string>('')
    const [backFatVolume, setBackFatVolume] = useState<string>('')
    const [soySauceVolume, setSoySauceVolume] = useState<string>('')

    const handleCallOption = () => {
        let callText = ""

        // ニンニクが選択されている場合
        if (garlicVolume) {
            if (garlicVolume === "ニンニク") {
                callText += `${garlicVolume}`
            } else {
                callText += `ニンニク${garlicVolume}`
            }
        }

        // 野菜が選択されている場合
        if (vegetablesVolume) {
            if (callText) {
                callText += `\n`
                if (vegetablesVolume !== "ヤサイ") callText += `ヤサイ`
            }
            callText += `${vegetablesVolume}`
        }

        // アブラが選択されている場合
        if (backFatVolume) {
            if (callText) {
                callText += `\n`
                if (backFatVolume !== "アブラ") callText += `アブラ`
            }
            callText += `${backFatVolume}`
        }

        // カラメが選択されている場合
        if (soySauceVolume) {
            if (callText) {
                callText += `\n`
                if (soySauceVolume !== "カラメ") callText += `カラメ`
            }
            callText += `${soySauceVolume}`
        }


        // トッピングコール結果画面遷移
        router.push({
            pathname: `simulation/postcall_result`,
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
                        source={{ uri: postCallImage.uri }}
                    />
                </Card>
                <Text style={styles.description}>
                    ラーメンが出来上がりました。{'\n'}
                    店員さんから{'\n'}
                    「ニンニク入れますか」と言われました。{'\n'}
                    トッピングコールしたい{'\n'}
                    オプションを選択しましょう。
                </Text>

                {/* ニンニク */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>ニンニク</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setGarlicVolume(value)}
                        value={garlicVolume}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="抜き" value="抜き" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                            <RadioButton.Item label="ニンニク" value="ニンニク" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシ" value="マシ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシマシ" value="マシマシ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* 野菜 */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>野菜</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setVegetablesVolume(value)}
                        value={vegetablesVolume}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="抜き" value="抜き" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                            <RadioButton.Item label="ヤサイ" value="ヤサイ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシ" value="マシ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシマシ" value="マシマシ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* アブラ */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>アブラ</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setBackFatVolume(value)}
                        value={backFatVolume}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="抜き" value="抜き" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                            <RadioButton.Item label="アブラ" value="アブラ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシ" value="マシ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシマシ" value="マシマシ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* カラメ */}
                <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>カラメ</Text>
                    <RadioButton.Group
                        onValueChange={(value) => setSoySauceVolume(value)}
                        value={soySauceVolume}
                    >
                        <View style={styles.radioItemGrid}>
                            <RadioButton.Item label="抜き" value="抜き" labelVariant="labelLarge" />
                            <RadioButton.Item label="少なめ" value="少なめ" labelVariant="labelLarge" />
                            <RadioButton.Item label="カラメ" value="カラメ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシ" value="マシ" labelVariant="labelLarge" />
                            <RadioButton.Item label="マシマシ" value="マシマシ" labelVariant="labelLarge" />
                        </View>
                    </RadioButton.Group>
                </View>

                {/* コールボタン */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="contained"
                        onPress={() => { router.push(`simulation/afterfinish`) }}
                    >
                        トッピング無し
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleCallOption}
                    >
                        トッピング有り
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