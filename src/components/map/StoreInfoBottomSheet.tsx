import { Dimensions, View, StyleSheet, useWindowDimensions } from "react-native"
import {
    ActivityIndicator,
    Button,
    IconButton,
    Modal,
    Portal,
    Text,
    useTheme
} from "react-native-paper"
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapStore } from "@/src/types/storeApiResponse"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { router } from "expo-router"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { StoreImageDownloadData } from "@/src/types/storeImage"
import { getStoreImages } from "@/src/api/ImageApi"
import { Image as ExpoImage } from "expo-image"

const { height } = Dimensions.get('window')

// ボトムシートの左右のパディング合計 (16px * 2)
const HORIZONTAL_MARGIN = 32
const IMAGE_WIDTH_RATIO = 0.8
const IMAGE_MARGIN_RIGHT = 8

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
    const [selectedImage, setSelectedImage] = useState<StoreImageDownloadData>()
    const [storeImages, setStoreImages] = useState<StoreImageDownloadData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { width: windowWidth } = useWindowDimensions()  // ウィンドウの幅を動的にシュトック
    const dynamicImageWidth = Math.floor((windowWidth - HORIZONTAL_MARGIN) * IMAGE_WIDTH_RATIO)
    const dynamicSnapInterval = dynamicImageWidth + IMAGE_MARGIN_RIGHT


    // 初期表示、店舗情報が変更された（map画面から店舗マーカークリック時）場合、店舗画像を取得
    useEffect(() => {
        if (store && store.id) {
            getStoreImagesInfo(store.id)
        } else {
            // ストアがnullになったら画像もクリア
            setStoreImages([])
        }
    }, [store])

    // APIから店舗画像を取得する。
    const getStoreImagesInfo = async (storeId: string | number) => {
        setIsLoading(true)
        setError(null)
        try {
            const imagesData = await getStoreImages(String(storeId))
            setStoreImages(imagesData)
        } catch (error) {
            console.error('店舗画像の取得に失敗しました:', error)
            setError('画像の読み込みに失敗しました')
        } finally {
            setIsLoading(false)
        }
    }

    // モーダルで画像を開く
    const openImageModal = useCallback((imageInfo: StoreImageDownloadData) => {
        setSelectedImage(imageInfo)
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
            handleCloseSheet()
            // 店舗詳細画面に遷移
            router.push({
                pathname: `store/detail`,
                params: { id: store.id }
            })
        }
    }, [store, handleCloseSheet])

    const snapToOffsets = useMemo(() =>
        storeImages.map((_, index) => index * dynamicSnapInterval),
        [storeImages.length])

    const renderHeader = (store: MapStore) => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={navigateToStoreDetail}>
                <Text variant="titleMedium" style={styles.storeName}>
                    {store.branch_name ? `${store.store_name} ${store.branch_name}` : store.store_name}
                </Text>
                <View style={styles.addressContainer}>
                    <MaterialIcons
                        name="location-on"
                        size={16}
                        color={theme.colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.storeAddress}>
                        {store.address}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )

    const renderFooter = () => (
        <Button
            mode="contained"
            onPress={handleCloseSheet}
            style={styles.closeButton}
            icon="close"
        >
            閉じる
        </Button>
    )

    const renderImageItem = ({ item }: { item: StoreImageDownloadData }) => (
        <TouchableOpacity
            onPress={() => openImageModal(item)}
        >
            <ExpoImage
                source={{ uri: item.image_url }}
                style={{
                    width: dynamicImageWidth,
                    height: 150,
                    borderRadius: 8,
                    marginRight: 8
                }}
                contentFit="cover"
                transition={300}
            />
        </TouchableOpacity>
    )

    if (!store) return null

    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                index={visible ? 0 : -1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                onChange={handleSheetChanges}
                handleIndicatorStyle={{ backgroundColor: theme.colors.outline }}
                backgroundStyle={{ backgroundColor: theme.colors.surface }}
                style={styles.sheetContainer}
                animateOnMount={true}
            >
                {isLoading ? (
                    <View style={styles.centeredContainer}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <BottomSheetView style={styles.contentContainer}>
                        {error ? (
                            <View style={styles.centeredContainer}>
                                <Text variant="bodyMedium" style={styles.errorText}>
                                    {error}
                                </Text>
                                {renderFooter()}
                            </View>
                        ) : (
                            <>
                                {renderHeader(store)}
                                {storeImages.length > 0 ? (
                                    <FlatList
                                        data={storeImages}
                                        keyExtractor={(item: StoreImageDownloadData) => item.id.toString()}
                                        renderItem={renderImageItem}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.imageListContent}
                                        snapToOffsets={snapToOffsets}
                                        decelerationRate="fast"
                                    />
                                ) : (
                                    <View style={styles.centeredContainer}>
                                        <Text variant="bodyMedium">
                                            店舗画像が登録されてません。
                                        </Text>
                                    </View>
                                )}
                                {renderFooter()}
                            </>
                        )}
                    </BottomSheetView>
                )}
            </BottomSheet>
            {/* 画像拡大モーダル */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.primaryContainer }]}
                >
                    <View style={styles.modalContent}>
                        <ExpoImage
                            source={{ uri: selectedImage?.image_url || '' }}
                            style={{
                                marginTop: 48,
                                width: dynamicImageWidth * 0.75,
                                height: height * 0.35
                            }}
                            contentFit="contain"
                            transition={300}
                        />
                        <View style={styles.modalMenuContainer} key={selectedImage?.id}>
                            <Text variant="titleMedium" style={styles.modalSectionTitle}>
                                <MaterialCommunityIcons name="menu" size={20} color={theme.colors.primary} />
                                【メニュー情報】
                            </Text>
                            <View style={styles.modalMenuRow}>
                                <Text style={styles.modalMenuLabel}>
                                    <MaterialCommunityIcons name="noodles" size={20} color={theme.colors.primary} />
                                    メニュー名：
                                </Text>
                                <Text style={styles.modalMenuValue}>{selectedImage?.menu_name}</Text>
                            </View>
                            <View style={styles.modalMenuRow}>
                                <Text style={styles.modalMenuLabel}>
                                    <MaterialCommunityIcons name="noodles" size={20} color={theme.colors.primary} />
                                    メニュー種別：
                                </Text>
                                <Text style={styles.modalMenuValue}>{selectedImage?.menu_type === 1 ? "通常メニュー" : "限定メニュー"}</Text>
                            </View>
                            <Text variant="titleMedium" style={styles.modalSectionTitle}>
                                <MaterialCommunityIcons name="chat" size={20} color={theme.colors.primary} />
                                【トッピングコール情報】
                            </Text>
                            {selectedImage?.topping_calls?.map((toppingOption) => (
                                <View style={styles.modalMenuRow} key={toppingOption.topping_id}>
                                    <Text style={styles.modalMenuLabel}>
                                        {toppingOption.topping_name}：
                                    </Text>
                                    <Text style={styles.modalMenuValue}>
                                        {toppingOption.call_option_name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setModalVisible(false)}
                        style={styles.closeIcon}
                        iconColor={theme.colors.onSurfaceVariant}
                    />
                </Modal>
            </Portal>
        </>
    )
}

const styles = StyleSheet.create({
    sheetContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        // 影をつける
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8
    },
    contentContainer: {
        flex: 1
    },
    headerContainer: {
        paddingHorizontal: 16
    },
    storeName: {
        fontWeight: "bold",
        marginBottom: 8,
        textDecorationLine: "underline"
    },
    addressContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    storeAddress: {
        marginLeft: 4,
        flexShrink: 1   // アドレスが長い場合に折り返す
    },
    imageListContent: {
        paddingVertical: 8,
        paddingLeft: HORIZONTAL_MARGIN / 2, // 左右にパディングを適用
        paddingRight: HORIZONTAL_MARGIN / 2 - IMAGE_MARGIN_RIGHT
    },
    centeredContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16
    },
    errorText: {
        textAlign: "center",
        padding: 16
    },
    closeButton: {
        margin: 16,
        borderRadius: 8
    },
    modalContainer: {
        margin: 0,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    modalContent: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundColor: "transparent"
    },
    modalImage: {
    },
    modalMenuContainer: {
        width: "100%",
        justifyContent: "flex-end",
        paddingHorizontal: 24,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        marginTop: 16,
        borderRadius: 16
    },
    modalSectionTitle: {
        fontWeight: "bold",
        marginVertical: 16
    },
    modalMenuRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16
    },
    modalMenuLabel: {
        fontWeight: "bold",
        width: "45%",
        lineHeight: 20
    },
    modalMenuValue: {
        width: "55%",
        lineHeight: 20

    },
    closeIcon: {
        position: "absolute",
        top: 32,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: 20
    }
})