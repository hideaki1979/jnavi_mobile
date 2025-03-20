import { Dimensions, View, Image, StyleSheet } from "react-native"
import { Button, Card, IconButton, Modal, Paragraph, Portal, Title, useTheme } from "react-native-paper"
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapStore } from "@/src/types/storeApiResponse"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { router } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { Asset } from "expo-asset"
import image1 from "../../../public/images/20241231_092738.jpg"
import image2 from "../../../public/images/20241231_093850.jpg"
import image3 from "../../../public/images/20250103_123700.jpg"
import image4 from "../../../public/images/8db1aafe-520f-4f66-aa99-4a42170425b7.jpg"
import image5 from "../../../public/images/c63b37eea2cbf11eb5e269139bcdf451.jpg"
import image6 from "../../../public/images/DSC03030-1.jpg"

const { width, height } = Dimensions.get('window')

// 公開画像のパス定義（レイアウト確認暫定対応）
const publicImages = [
    image1, image2, image3, image4, image5, image6
]

interface StoreInfoProps {
    visible: boolean;
    store: MapStore | null;
    onClose: () => void;
}

export default function StoreInfoBottomSheet({ visible, store, onClose }: StoreInfoProps) {
    const theme = useTheme()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => ['50%'], [])

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [localImages, setLocalImages] = useState<string[]>([])

    // ローカル画像をURIに変換する（レイアウト確認暫定対応）
    useEffect(() => {
        const loadLocalImages = async () => {
            try {
                const uriPromises = publicImages.map(async (img) => {
                    const asset = Asset.fromModule(img)
                    await asset.downloadAsync()
                    return asset.uri
                })
                const imageUrls = await Promise.all(uriPromises)
                setLocalImages(imageUrls)
            } catch (error) {
                console.error("画像読み込み失敗：", error)
            }
        }
        loadLocalImages()
    }, [])

    const openImageModal = useCallback((imageUrl: string) => {
        setSelectedImage(imageUrl)
        setModalVisible(true)
    }, [])

    // BottomSheetの状態変化を検知する処理（スワイプ操作など）
    const handleSheetChanges = useCallback((index: number) => {
        // スワイプで閉じられた場合も親コンポーネントに通知
        if (index === -1) {
            onClose()
        }
    }, [onClose])

    // 閉じるボタンが押されたときの処理
    const handleCloseSheet = useCallback(() => {
        // BottomSheetを直接閉じる
        bottomSheetRef.current?.close()
        // 親コンポーネントのonCloseも呼び出す
        onClose()
    }, [onClose])

    // 店舗詳細画面遷移
    const navigateToStoreDetail = useCallback(() => {
        // BottomSheetを閉じる
        if (store && store.id) {
            bottomSheetRef.current?.close()
            // 親コンポーネントのonCloseも呼び出す
            onClose()
            // 店舗詳細画面に遷移
            console.log("店舗詳細画面遷移")
            router.push({
                pathname: `store/detail`,
                params: { id: store?.id }
            })
        }
    }, [store, onClose])

    if (!store) return null

    // 表示する画像の配列を決定
    // APIから画像があればそれを表示し、なければローカル画像を表示
    const displayImages = (store.images && store.images.length > 0) ? store.images : localImages

    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                index={visible ? 0 : -1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onChange={handleSheetChanges}
                handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
                backgroundStyle={{ backgroundColor: theme.colors.background }}
                style={styles.sheetContainer}
                animateOnMount={true}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <TouchableOpacity onPress={navigateToStoreDetail}>
                                <Title style={styles.storeName}>
                                    {store.branch_name ? `${store.store_name} ${store.branch_name}` : `${store.store_name}`}
                                </Title>
                                <Paragraph style={styles.storeAddress}>
                                    <MaterialIcons name="location-on" size={14} color={theme.colors.primary} />
                                    {" " + store.address}
                                </Paragraph>
                            </TouchableOpacity>
                        </Card.Content>
                        {/* 画像スライダー */}
                        {/* {store.images && store.images.length > 0 && ( */}
                        {displayImages.length > 0 && (
                            <BottomSheetView style={styles.imageContainer}>
                                <FlatList
                                    data={displayImages}
                                    horizontal
                                    pagingEnabled
                                    snapToInterval={width * 0.65}
                                    snapToAlignment="center"
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 8 }}
                                    renderItem={({ item }: { item: string }) => (
                                        <TouchableOpacity onPress={() => openImageModal(item)}>
                                            <Image
                                                source={{ uri: item }}
                                                style={styles.storeImages}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(_: string, index: number) => index.toString()}
                                    style={styles.imageList}
                                />
                            </BottomSheetView>
                        )}
                    </Card>

                    {/* 閉じるボタン */}
                    <Button
                        mode="outlined"
                        onPress={handleCloseSheet}
                        style={styles.closeButton}
                        icon="close"
                    >
                        閉じる
                    </Button>
                </BottomSheetView>
            </BottomSheet>
            {/* 画像拡大モーダル */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: selectedImage || '' }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={() => setModalVisible(false)}
                            style={styles.closeIcon}
                            iconColor={theme.colors.onSurfaceVariant}
                        />
                    </View>
                </Modal>
            </Portal>
        </>
    )
}

const styles = StyleSheet.create({
    sheetContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    card: {
        margin: 8,
        elevation: 0
    },
    storeName: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        textDecorationLine: "underline"
    },
    storeAddress: {
        fontSize: 12,
        marginBottom: 16,
        textDecorationLine: "underline"
    },
    imageContainer: {
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 8
    },
    imageList: {
        flexGrow: 0
    },
    storeImages: {
        width: width * 0.6,
        height: 150,
        borderRadius: 8,
        marginRight: 8
    },
    closeButton: {
        marginVertical: 16,
        marginHorizontal: 8,
        borderRadius: 8
    },
    modalContainer: {
        margin: 0,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white"
    },
    modalContent: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        position: "relative",
        backgroundColor: "transparent"
    },
    modalImage: {
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 8,
        backgroundColor: "white"
    },
    closeIcon: {
        position: "absolute",
        top: 32,
        right: 16,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 20
    }
})