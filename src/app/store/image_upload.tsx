import { formatToppingOptions, ToppingOption } from "@/src/utils/toppingFormatter"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { Button, Divider, RadioButton, Snackbar, Text, TextInput, useTheme } from "react-native-paper"
import * as ImagePicker from "expo-image-picker"
import { SaveFormat, ImageManipulator } from "expo-image-manipulator"
import { getStoreToppingCalls } from "@/src/api/storeApi"
import { getCallOptions, getToppings } from "@/src/api/toppingApi"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native"
import { Image as ExpoImage } from "expo-image"
import BottomAppBar from "@/src/components/navigation/BottomAppBar"
import LoadingErrorContainer from "@/src/components/feedback/LoadingErrorContainer"
import { SelectedToppingInfo, StoreImageUploadData } from "@/src/types/storeImage"
import { uploadStoreImage } from "@/src/api/ImageApi"
import ImageUploadToppingSelector from "@/src/components/store/ImageUploadToppingSelector"

// メニュータイプの定義
const MENU_TYPES = [
    { label: '通常メニュー', value: '1' },
    { label: '限定メニュー', value: '2' }
]

export default function ImageUpload() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const theme = useTheme()

    // 状態管理
    const [image, setImage] = useState<string | null>(null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [menuType, setMenuType] = useState<string>('1')   // デフォルトは通常メニュー 
    const [menuName, setMenuName] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [uploading, setUploading] = useState<boolean>(false)
    const [dataLoading, setDataLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false)
    const [snackBarMessage, setSnackBarMessage] = useState<string>('')
    const [isSuccess, setIsSuccess] = useState<boolean>(false)

    // 店舗別トッピングオプションとユーザ選択の状態管理
    const [toppingOptions, setToppingOptions] = useState<ToppingOption[]>([])
    // const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

    const [selectedToppingInfo, setSelectedToppingInfo] = useState<Record<string, SelectedToppingInfo>>({})

    // 画像ピッカーの権限確認
    useEffect(() => {
        (async () => {
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (galleryStatus.status === 'denied' ||
                (galleryStatus.accessPrivileges === 'none')) {
                setError("本画面では画像へのアクセス許可が必要です。")
                setSnackBarVisible(true)
            }

            // 制限付きアクセスの場合（必要に応じて）
            if (galleryStatus.accessPrivileges === 'limited') {
                setSnackBarMessage("一部の写真のみへのアクセスが許可されています")
                setSnackBarVisible(true)
            }

            setLoading(false)
        })()
    }, [])

    // トッピング情報の取得
    useEffect(() => {
        /**
         * 店舗のトッピングコール情報を取得する
         * 
         * トッピング情報、店舗別トッピングコール情報、コールオプション情報を並列で取得
         * 取得したデータを状態管理に反映
         * 
         * @throws トッピング情報、店舗別トッピングコール情報、コールオプション情報の取得に失敗した場合
         */
        const fetchToppingData = async () => {
            try {
                // トッピング情報を取得
                const [storeToppingCalls, toppings, callOptions] =
                    await Promise.all([
                        getStoreToppingCalls(id, "all"),
                        getToppings(),
                        getCallOptions()
                    ])

                // 店舗別トッピングコール情報が無ければ何もせずリターン
                if (storeToppingCalls.store_topping_calls && storeToppingCalls.store_topping_calls.length > 0) {
                    const formattedOption = formatToppingOptions(
                        storeToppingCalls.store_topping_calls,
                        toppings,
                        callOptions,
                        'all',
                        true // store_topping_call_idも含めるオプション
                    )
                    setToppingOptions(formattedOption)
                    // console.log("formattedOption：", JSON.stringify(formattedOption, null, 2))
                }

            } catch (error) {
                console.error("トッピングコール情報取得エラー：", error)
                setError("トッピングコール情報取得時にエラーが発生しました。")
                setSnackBarVisible(true)
            } finally {
                setDataLoading(false)
            }
        }
        fetchToppingData()

    }, [id])

    /**
     * 画像選択ダイアログを表示し、選択された画像をprocessImageに渡す
     * 
     * 画像選択ダイアログを表示し、選択された画像をbase64形式に変換して
     * processImageに渡す。エラーが発生した場合はエラーメッセージを表示
     */
    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1
            })

            if (!result.canceled) {
                await processImage(result.assets[0].uri, result.assets[0].mimeType)
            }
        } catch (error) {
            console.error("画像選択時にエラーが発生：", error)
            setError("画像選択時にエラーが発生しました。")
            setSnackBarVisible(true)
        }
    }

    /**
     * 画像をBase64形式に変換する
     * 
     * URIを指定して、画像をBase64形式に変換し、ステートに保存
     * @param uri 画像のURI
     * @throws 画像の読み込みやBase64変換に失敗した場合
     */
    const processImage = async (uri: string, mimeType: string | undefined) => {
        try {
            // MimeタイプからBase64形式の保存フォーマットを決める
            const format = getFormatFromMimeType(mimeType)

            // 画像コンテキストの作成
            const manipulator = ImageManipulator.manipulate(uri)

            // 画像のサイズを調整して品質を最適化
            manipulator.resize({
                width: 1080
            })

            // 画像を描画
            const resizeImage = await manipulator.renderAsync()

            // Base64形式で画像を保存
            const result = await resizeImage.saveAsync({
                format,
                compress: 0.8,
                base64: true
            })

            const formattedBase64 = `data:${mimeType};base64,${result.base64}`
            // console.log("画像サイズ圧縮後：", formattedBase64)

            // 処理後の画像をステートに保存
            setImage(result.uri)
            setImageBase64(formattedBase64 || null)
        } catch (error) {
            console.error("画像サイズ圧縮中にエラーが発生:", error)
            setError("画像サイズ圧縮処理に失敗しました。")
            setSnackBarVisible(true)
        }
    }

    /**
     * MIMEタイプをチェックしてBase64形式で画像を決める
     * @param mimeType MIMEタイプ
     * @returns Base64形式で画像を保存する形式
     */
    const getFormatFromMimeType = (mimeType: string | undefined): SaveFormat => {
        // MIMEタイプをチェックしてBase64形式で画像を決める
        switch (mimeType) {
            case 'image/jpeg':
                return SaveFormat.JPEG
            case 'image/png':
                return SaveFormat.PNG
            case 'image/webp':
                return SaveFormat.WEBP
            default:
                return SaveFormat.JPEG
        }
    }

    /**
     * 画像アップロード処理
     * 
     * トッピング選択を処理し、画像をBase64形式に変換して、APIにアップロードする
     * 
     * @throws 画像のBase64変換やアップロードに失敗した場合
     */
    const handleUpload = async () => {
        try {
            setUploading(true)

            // トッピング選択を処理
            const toppingSelections = Object.entries(selectedToppingInfo).map(([toppingId, info]) => ({
                topping_id: Number(toppingId),
                call_option_id: Number(info.optionId),
                // store_topping_call_idが存在する場合のみ追加
                ...(info.storeToppingCallId ? { store_topping_call_id: info.storeToppingCallId } : {})
            }))

            // アップロードデータの準備
            const uploadData: StoreImageUploadData = {
                store_id: Number(id),
                menu_type: Number(menuType),
                menu_name: menuName,
                image_base64: imageBase64,
                ...(toppingSelections.length > 0 ? { topping_selections: toppingSelections } : {})
            }

            // console.log("アップロードデータ：", JSON.stringify(uploadData, null, 2))

            // アップロード実行
            await uploadStoreImage(id, uploadData)

            // 完了表示
            setIsSuccess(true)
            setSnackBarMessage("画像アップロード処理が完了しました。")
            setSnackBarVisible(true)

            // スナックバー表示後にMAPに遷移する。
            setTimeout(() => {
                router.push({
                    pathname: "store/map"
                })
            }, 3000)

        } catch (error) {
            console.error('アップロードエラー:', error)
            setError(error instanceof Error ? error.message : '画像のアップロードに失敗しました')
            setSnackBarVisible(true)
        } finally {
            setUploading(false)
        }
    }

    /**
     * トッピングオプション選択状態変更ハンドラ
     * @param toppingId トッピングID
     * @param optionId オプションID
     */
    const handleOptionChange = (toppingId: string, optionId: string, storeToppingCallId?: string) => {
        // setSelectedOptions(prev => ({
        //     ...prev,
        //     [toppingId]: optionId
        // }))

        setSelectedToppingInfo(prev => ({
            ...prev,
            [toppingId]: {
                optionId,
                storeToppingCallId
            }
        }))
        // console.log("toppingId, optionId, storeToppingCallId：", toppingId, optionId, storeToppingCallId)
    }

    if (loading || dataLoading) {
        return <LoadingErrorContainer loading={true} error={null} />
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            <HeaderAppBar
                showBackButton={true}
                title="店舗別画像アップロード"
            />
            {/* キーボード表示時に入力フィールドがキーボードに隠れないようにするコンテナ */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 32} // iOSでオフセットを追加
            >
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* 画像選択エリア */}
                    <View style={styles.imageContainer}>
                        {image ? (
                            <View style={styles.selectedImageContainer}>
                                <ExpoImage
                                    source={{ uri: image }}
                                    contentFit="cover"
                                    transition={500}
                                    style={styles.selectedImage}
                                />
                                <Button
                                    mode="contained-tonal"
                                    onPress={() => {
                                        setImage(null)
                                        setImageBase64(null)
                                    }}
                                    icon="file-image-minus"
                                    style={styles.removeButton}
                                    buttonColor={theme.colors.primary}
                                >
                                    削除
                                </Button>
                            </View>
                        ) : (
                            <View style={styles.imageButtonContainer}>
                                {/* <MaterialCommunityIcons
                                    name="file-image-plus"
                                    size={20}
                                    color={theme.colors.primary}
                                    onPress={handlePickImage}
                                />
                                <Text>画像選択</Text> */}
                                <Button
                                    mode="contained"
                                    onPress={handlePickImage}
                                    buttonColor={theme.colors.primary}
                                    icon="file-image-plus"
                                    style={styles.imageButton}
                                >
                                    画像選択
                                </Button>
                            </View>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    {/* メニュー情報入力エリア */}
                    <Text style={styles.sectionTitle}>メニュー情報</Text>
                    <View style={styles.radioGroup}>
                        <Text style={styles.fieldLabel}>メニュータイプ</Text>
                        <RadioButton.Group
                            onValueChange={value => setMenuType(value)}
                            value={menuType}
                        >
                            <View style={styles.radioOptionsContainer}>
                                {MENU_TYPES.map((menu) => (
                                    <View key={menu.value} style={styles.radioOption}>
                                        <RadioButton.Item
                                            label={menu.label}
                                            value={menu.value}
                                            labelVariant="bodyMedium"
                                        />
                                    </View>
                                ))}
                            </View>
                        </RadioButton.Group>
                    </View>

                    <TextInput
                        label="メニュー名"
                        value={menuName}
                        onChangeText={setMenuName}
                        mode="outlined"
                        placeholder="小ラーメン"
                        style={styles.textInput}
                    />

                    {/* トッピングオプション選択 */}
                    {toppingOptions.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>トッピングオプション</Text>
                            <ImageUploadToppingSelector
                                options={toppingOptions}
                                selectedOptions={selectedToppingInfo}
                                onOptionChange={handleOptionChange}
                            />
                        </View>
                    )}

                    {/* アップロードボタン */}
                    <View style={styles.uploadButtonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleUpload}
                            disabled={uploading || !image || !menuName.trim()}
                            loading={uploading}
                            icon="cloud-upload"
                            style={styles.uploadButton}
                        >
                            {uploading ? "アップロード中" : "アップロード"}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* フッター */}
            <BottomAppBar showRoutes={['map', 'simulation']} />

            {/* スナックバー */}
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                style={{
                    backgroundColor: isSuccess ? theme.colors.primary : theme.colors.error
                }}
            >
                {isSuccess ? snackBarMessage : error}
            </Snackbar>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        flex: 1
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 8
    },
    imageButtonContainer: {
        width: "100%",
        padding: 8,
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 8,
        borderColor: "#817f7f",
        borderStyle: "dashed"
    },
    imageButton: {
        width: "100%"
    },
    selectedImageContainer: {
        width: "100%",
        alignItems: "center"
    },
    selectedImage: {
        width: "100%",
        height: 200,
        borderRadius: 8
    },
    removeButton: {
        width: "100%",
        marginTop: 8
    },
    divider: {
        marginVertical: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16

    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "bold"
    },
    radioGroup: {
        marginBottom: 8
    },
    radioOptionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8
    },
    radioOption: {
        width: "50%"
    },
    textInput: {
        marginBottom: 24
    },
    textAreaInput: {
        minHeight: 150
    },
    uploadButtonContainer: {
        alignItems: "center"
    },
    uploadButton: {
        width: "80%"
    }

})