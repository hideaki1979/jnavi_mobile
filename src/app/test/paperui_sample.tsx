import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { ActivityIndicator, Appbar, Avatar, Banner, Button, Checkbox, Divider, RadioButton, SegmentedButtons, Snackbar, Switch, Text, TextInput, useTheme } from "react-native-paper"


/**
 * Expo RouterのUI Sample
 * 
 * React Native Paperの各種UIコンポーネントを試すことができます。
 * 
 *  * テキスト入力
 *  * スイッチ
 *  * チェックボックス
 *  * ラジオボタン
 *  * セグメントボタン
 *  * 読み込みアニメーション
 *  * バナー
 *  * スナックバー
 */
const PaperUISample = () => {
    const theme = useTheme()
    const [text, setText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [switchValue, setSwitchValue] = useState(false)
    const [checkboxStatus, setCheckboxStatus] = useState(false)
    const [radioValue, setRadioValue] = useState('')
    const [segmentValue, setSegmentValue] = useState('')
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [bannerVisible, setBannerVisible] = useState(false)

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            {/*  */}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="UI Sample" />
            </Appbar.Header>
            <Banner
                visible={bannerVisible}
                actions={[
                    {
                        label: '確認',
                        onPress: () => setBannerVisible(false)
                    },
                    {
                        label: '閉じる',
                        onPress: () => setBannerVisible(false)
                    }
                ]}
                icon={() => (
                    <Avatar.Icon size={40} icon='alert' />
                )}
            >
                バナーを開くとこちらの情報が表示されます。
            </Banner>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.primary }]} variant='labelLarge' >loading...</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setIsLoading(false)}
                    >
                        戻る
                    </Button>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    {/* テキスト入力 */}
                    <View style={styles.section}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>
                            テキスト入力
                        </Text>
                        <TextInput
                            label='テキスト入力できます'
                            value={text}
                            onChangeText={text => setText(text)}
                        />
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.section}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>基本コンポーネント</Text>
                        <View style={styles.row}>
                            <Text variant='titleMedium'>スイッチ</Text>
                            <Switch
                                value={switchValue}
                                onValueChange={() => setSwitchValue(!switchValue)}
                            />
                        </View>
                        <View style={styles.row}>
                            <Text variant="titleMedium">チェックボックス</Text>
                            <Checkbox
                                status={checkboxStatus ? "checked" : "unchecked"}
                                onPress={() => setCheckboxStatus(!checkboxStatus)}
                            />
                        </View>

                        <Text variant='titleMedium' style={styles.sectionTitle} >ラジオボタン</Text>
                        <RadioButton.Group
                            onValueChange={value => setRadioValue(value)}
                            value={radioValue}
                        >
                            <View style={styles.radioContainer}>
                                <View style={styles.radioRow}>
                                    <RadioButton value="1" />
                                    <Text>Radio 1</Text>
                                </View>
                                <View style={styles.radioRow}>
                                    <RadioButton value="2" />
                                    <Text>Radio 2</Text>
                                </View>
                            </View>
                        </RadioButton.Group>

                        <Text variant='titleMedium' style={styles.sectionTitle}>セグメントボタン</Text>
                        <SegmentedButtons
                            value={segmentValue}
                            onValueChange={setSegmentValue}
                            buttons={[
                                { value: 'walk', label: '散歩', icon: 'walk' },
                                { value: 'train', label: '電車', icon: 'train' },
                                { value: 'car', label: '車', icon: 'car' }

                            ]}
                        />
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.section}>
                        <Text variant='titleMedium' style={styles.sectionTitle}>アクション</Text>
                        <Button
                            mode='contained'
                            onPress={() => setIsLoading(true)}
                            style={styles.button}
                        >
                            読み込み開始
                        </Button>
                        <Button
                            mode='contained'
                            onPress={() => setBannerVisible(true)}
                            style={styles.button}
                        >
                            バナー表示
                        </Button>
                        <Button
                            mode='contained'
                            onPress={() => setSnackbarVisible(true)}
                            style={styles.button}
                        >
                            スナックバー表示
                        </Button>
                    </View>
                </ScrollView>
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(!snackbarVisible)}
                action={{
                    label: '閉じる',
                    onPress: () => setSnackbarVisible(!snackbarVisible)
                }}
                duration={10000}
            >
                エラーや正常終了などのメッセージ表示に使います
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16
    },
    loadingText: {
        marginVertical: 16
    },
    scrollView: {
        flex: 1,
        padding: 16
    },
    section: {
        marginBottom: 16
    },
    sectionTitle: {
        marginBottom: 8
    },
    divider: {
        marginVertical: 16
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '40%'
    },
    button: {
        marginVertical: 8
    }

})

export default PaperUISample