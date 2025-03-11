import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import MapView, { Callout, Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Appbar, Text, useTheme } from 'react-native-paper'
import { getMapAll } from '@/src/api/api'
import { MapData } from '@/src/types/storeApiResponse'
import { router } from 'expo-router'

export default function Map() {
    const theme = useTheme()
    const [markers, setMarkers] = useState<MapData[]>([])

    useEffect(() => {
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

        fetchMapData()
    }, [])

    // マーカーのCalloutタップ時に詳細画面へ遷移する。
    const handleCalloutPress = (storeId: number) => {
        router.push(`store/detail?id=${storeId}`)
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar style={theme.dark ? "light" : "dark"} />
            {/* 地図エリア */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 35.5988799,
                        longitude: 139.6084791,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05
                    }}
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
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
            <Appbar style={styles.bottomBar}>
                <Appbar.Action icon="map" onPress={() => { }} />
                <Appbar.Action icon="home" onPress={() => { }} />
                <Appbar.Action icon="plus-box"
                    onPress={() => { router.push(`store/create`) }} />
                <Appbar.Action icon="tune-vertical" onPress={() => { }} />
                <Appbar.Action icon="account" onPress={() => { }} />
            </Appbar>
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
