import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Alert, Dimensions, Platform, StyleSheet, View } from 'react-native'
import MapView, { Marker, Region } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from 'react-native-paper'
import { getMapAll } from '@/src/api/storeApi'
import { MapData, MapStore } from '@/src/types/storeApiResponse'
import * as Location from 'expo-location'
import BottomAppBar from '@/src/components/navigation/BottomAppBar'
import LoadingErrorContainer from '@/src/components/feedback/LoadingErrorContainer'
import StoreInfoBottomSheet from '@/src/components/map/StoreInfoBottomSheet'

/**
 * Mapコンポーネントは、現在位置とマーカーを表示する地図をレンダリングします。
 * 
 * 機能:
 * - 現在地情報の取得と表示
 * - APIから取得した複数のマーカーを地図上に表示
 * - マーカーをタップすると店舗情報のボトムシートを表示
 * - 位置情報の取得エラー時にデフォルトの位置を設定
 * 
 * ステート:
 * - markers: マップに表示するマーカーの配列
 * - initialRegion: 地図の初期表示位置
 * - loading: データ取得中かどうかの状態
 * - selectedStore: 選択されたマーカーの店舗情報
 * - isBottomSheetVisible: ボトムシートの表示状態
 */

export default function Map() {
    const theme = useTheme()
    const [markers, setMarkers] = useState<MapData[]>([])
    const [initialRegion, setInitialRegion] = useState<Region | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedStore, setSelectedStore] = useState<MapStore | null>(null)
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState<boolean>(false)

    useEffect(() => {
        // 現在位置情報を取得する。
        const getLocation = async () => {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync()

                if (status != 'granted') {
                    Alert.alert(
                        '現在地情報利用許可',
                        '現在地を表示するには位置情報の利用許可が必要です。',
                        [{ text: 'OK' }]
                    )
                    // エラー時の初期表示位置
                    setDefaultLocation()
                    setLoading(false)
                    return
                }

                // 現在地情報を取得
                try {
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Platform.OS === 'android'
                            ? Location.Accuracy.High
                            : Location.Accuracy.Balanced
                    })

                    // 現在位置を地図の初期表示位置に設定
                    setInitialRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05
                    })
                } catch (error) {
                    console.error("errorLog：", error)
                    // エラー時の初期表示位置
                    setDefaultLocation()
                }

            } catch (error) {
                console.error("現在地情報取得に失敗しました", error)
                // エラー時の初期表示位置
                setDefaultLocation()
            } finally {
                setLoading(false)
            }
        }

        // APIからマーカーデータを取得
        const fetchMapData = async () => {
            try {
                const data = await getMapAll()
                // console.log("MapData：", JSON.stringify(data, null, 2))
                if (data) {
                    setMarkers(data)
                }
            } catch (error) {
                console.error('マップデータの取得に失敗しました:', error)
            }
        }
        getLocation()
        fetchMapData()
    }, [])

    // デフォルトの位置を設定する関数
    const setDefaultLocation = () => {
        setInitialRegion({
            latitude: 35.5988799,
            longitude: 139.6084791,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
        })
    }

    const handlerMarkerPress = (store: MapStore) => {
        setSelectedStore(store)
        setIsBottomSheetVisible(true)
    }

    if (loading) {
        return <LoadingErrorContainer loading={loading} error={null} />
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* 地図エリア */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={initialRegion || undefined}
                    showsUserLocation={true}
                    provider='google'
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
                            pinColor={marker.store.is_close ? 'red' : 'yellow'}
                            onPress={(e) => {
                                e.stopPropagation()
                                handlerMarkerPress(marker.store)
                            }}
                            tracksViewChanges={false}
                        >
                        </Marker>
                    ))}
                </MapView>
                <StoreInfoBottomSheet
                    visible={isBottomSheetVisible}
                    store={selectedStore}
                    onClose={() => setIsBottomSheetVisible(false)}
                />
            </View>

            {/* フッター (Appbar) */}
            <BottomAppBar showRoutes={['create', 'simulation', 'home']} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    map: {
        width: Dimensions.get('window').width,
        height: '100%'
    }
})
