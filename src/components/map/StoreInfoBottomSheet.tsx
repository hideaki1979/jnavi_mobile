import { Dimensions, View, StyleSheet } from "react-native"
import { ActivityIndicator, Button, Card, IconButton, Modal, Paragraph, Portal, Text, Title, useTheme } from "react-native-paper"
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapStore } from "@/src/types/storeApiResponse"
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { router } from "expo-router"
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { StoreImageDownloadData } from "@/src/types/storeImage"
import { getStoreImages } from "@/src/api/ImageApi"
import { Image as ExpoImage } from "expo-image"

const { width, height } = Dimensions.get('window')

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

    // 初期表示、店舗情報が変更された（map画面から店舗マーカークリック時）場合、店舗画像を取得
    useEffect(() => {
        if (store && store.id) {
            getStoreImagesInfo(store.id)
        }
    }, [store])

    // APIから店舗画像を取得する。
    const getStoreImagesInfo = async (storeId: string | number) => {
        setIsLoading(true)
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
            bottomSheetRef.current?.close()
            // 親コンポーネントのonCloseも呼び出す
            onClose()
            // 店舗詳細画面に遷移
            router.push({
                pathname: `store/detail`,
                params: { id: store?.id }
            })
        }
    }, [store, onClose])

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
                        <BottomSheetView style={styles.imageContainer}>
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                </View>
                            ) : error ? (
                                <Paragraph style={styles.errorText}>画像の読み込みに失敗しました。</Paragraph>
                            ) : storeImages.length > 0 ? (
                                <FlatList
                                    data={storeImages}
                                    horizontal
                                    pagingEnabled
                                    snapToInterval={width * 0.65}
                                    snapToAlignment="center"
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 8 }}
                                    renderItem={({ item }: { item: StoreImageDownloadData }) => (
                                        <TouchableOpacity onPress={() => openImageModal(item)}>
                                            <ExpoImage
                                                source={{ uri: item.image_url }}
                                                style={styles.storeImages}
                                                contentFit="cover"
                                                transition={300}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item: StoreImageDownloadData) => item.id.toString()}
                                    style={styles.imageList}
                                />
                            ) : (
                                <Paragraph style={styles.noImageText}>店舗画像が登録されてません。</Paragraph>
                            )}
                        </BottomSheetView>
                        {/* )} */}
                    </Card>

                    {/* 閉じるボタン */}
                    <Button
                        mode="contained"
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
                    contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.primaryContainer }]}
                >
                    <View style={styles.modalContent}>
                        <ExpoImage
                            source={{ uri: selectedImage?.image_url || '' }}
                            style={styles.modalImage}
                            contentFit="contain"
                            transition={300}
                        />
                        <View style={styles.modalMenuContainer} key={selectedImage?.id}>
                            <Paragraph style={styles.modalSectionTitle}>
                                <MaterialCommunityIcons name="menu" size={20} color={theme.colors.primary} />
                                【メニュー情報】
                            </Paragraph>
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
                            <Paragraph style={styles.modalSectionTitle}>
                                <MaterialCommunityIcons name="chat" size={20} color={theme.colors.primary} />
                                【トッピングコール情報】
                            </Paragraph>
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
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
        textDecorationLine: "underline"
    },
    storeAddress: {
        fontSize: 10,
        marginBottom: 8,
        textDecorationLine: "underline"
    },
    imageList: {
        flexGrow: 0
    },
    imageContainer: {
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingTop: 8
    },
    storeImages: {
        width: width * 0.6,
        height: 120,
        borderRadius: 8,
        marginRight: 8
    },
    loadingContainer: {
        height: 120,
        justifyContent: "center",
        alignItems: "center"
    },
    errorText: {
        textAlign: "center",
        color: "red",
        padding: 16
    },
    noImageText: {
        textAlign: "center",
        padding: 16
    },
    closeButton: {
        marginVertical: 8,
        marginHorizontal: 8,
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
        marginTop: 48,
        width: width * 0.75,
        height: height * 0.35
        // backgroundColor: "yellow"
    },
    modalMenuContainer: {
        width: "100%",
        justifyContent: "flex-end",
        paddingHorizontal: 24,
        // backgroundColor: "rgba(233, 253, 8, 0.9)",
        marginBottom: 16
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 16
    },
    modalMenuRow: {
        flexDirection: "row",
        marginBottom: 16
    },
    modalMenuLabel: {
        fontSize: 14,
        fontWeight: "bold",
        width: "40%",
        lineHeight: 20
    },
    modalMenuValue: {
        fontSize: 12,
        width: "50%",
        lineHeight: 20

    },
    closeIcon: {
        position: "absolute",
        top: 24,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 20
    }
})