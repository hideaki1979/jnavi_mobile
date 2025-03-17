import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Alert, Dimensions, Platform, StyleSheet, View } from 'react-native'
import MapView, { Callout, Marker, Region } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, useTheme } from 'react-native-paper'
import { getMapAll } from '@/src/api/storeApi'
import { MapData } from '@/src/types/storeApiResponse'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import BottomAppBar from '@/src/components/navigation/BottomAppBar'
import LoadingErrorContainer from '@/src/components/feedback/LoadingErrorContainer'

export default function Map() {
    const theme = useTheme()
    const [markers, setMarkers] = useState<MapData[]>([])
    const [initialRegion, setInitialRegion] = useState<Region | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

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

    // マーカーのCalloutタップ時に詳細画面へ遷移する。
    const handleCalloutPress = (storeId: number) => {
        router.push(`store/detail?id=${storeId}`)
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
                >
                    {/* 現在地のマーカー表示 */}
                    {/* {initialRegion && (
                        <Marker
                            coordinate={{
                                latitude: initialRegion.latitude,
                                longitude: initialRegion.longitude
                            }}
                            pinColor='blue'
                            title='現在地'
                        />
                    )} */}

                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
                            pinColor='orange'
                        >
                            <Callout
                                onPress={() => handleCalloutPress(Number(marker.store.id))}
                                tooltip={false}
                            >
                                <View style={styles.calloutContainer}>
                                    <Text style={[styles.calloutTitle, { color: theme.colors.primary }]}>
                                        {marker.store.branch_name ? `店舗名： ${marker.store.store_name} ${marker.store.branch_name}` : `店舗名： ${marker.store.store_name}`}
                                    </Text>
                                    <Text style={styles.calloutDescription}>{marker.store.address}</Text>
                                    <Text style={styles.calloutAction}>
                                        詳細画面へ
                                    </Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>

            {/* フッター (Appbar) */}
            <BottomAppBar showRoutes={['create', 'simulation']} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mapContainer: {
        flex: 1
    },
    map: {
        width: Dimensions.get('window').width,
        height: '100%'
    },
    bottomBar: {
        justifyContent: 'space-around'
    },
    calloutContainer: {
        width: 300,
        padding: 16
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8
    },
    calloutDescription: {
        marginBottom: 8
    },
    calloutAction: {
        color: '#1976D2',
        fontWeight: "bold"
    }
})
