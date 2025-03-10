import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Appbar, useTheme } from 'react-native-paper'
import { getMapAll } from '@/src/api/api'
import { MapData } from '@/src/types/storeApiResponse'

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
                            title={marker.store.branch_name ? `店舗名： ${marker.store.store_name} ${marker.store.branch_name}` : `店舗名： ${marker.store.store_name}`}
                            description={marker.store.address}
                        />
                    ))}
                </MapView>
            </View>

            {/* フッター (Appbar) */}
            <Appbar style={styles.bottomBar}>
                <Appbar.Action icon="map" onPress={() => { }} />
                <Appbar.Action icon="home" onPress={() => { }} />
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

    }
})
