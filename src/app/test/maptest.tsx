import { useEffect, useState } from "react"
import { StyleSheet, View, Text } from "react-native"
import MapView, { Marker, Region } from "react-native-maps"
import * as Location from "expo-location"

// マーカーのデータ型
type Marker = {
    id: number;
    latitude: number;
    longitude: number;
}

const markersData: Marker[] =
    [
        {
            id: 1,
            latitude: 35.662346819815305,
            longitude: 139.6991631860567
        },
        {
            id: 2,
            latitude: 35.6640117157159,
            longitude: 139.6993884915927
        },
        {
            id: 3,
            latitude: 35.663218497391604,
            longitude: 139.69760750497448
        },
        {
            id: 4,
            latitude: 35.661762790515354,
            longitude: 139.69710324972715
        },
        {
            id: 5,
            latitude: 35.66078649319146,
            longitude: 139.69840143876814
        }

    ]


export default function MapTest() {

    const [initRegion, setInitRegion] = useState<Region | null>(null)
    const [markers, setMarkers] = useState<Marker[]>([])
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        // 位置情報のアクセス許可を取り、現在地情報を取得する
        const getCurrentLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                setErrorMsg("位置情報へのアクセスが拒否されました")
                return
            }

            try {
                const location = await Location.getCurrentPositionAsync({})
                setInitRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                })
                // console.log("現在地情報：", JSON.stringify(location, null, 2))
            } catch (error) {
                console.error("現在地情報取得エラー：", error)
            }
        }
        getCurrentLocation()
        // マーカー情報を取得する
        setMarkers(markersData)
    }, [])

    return (
        <>
            <View style={styles.container}>
                {errorMsg ? (
                    <Text>{errorMsg}</Text>
                )
                    :
                    // あああ
                    (<MapView
                        style={styles.mapContainer}
                        region={initRegion || undefined}
                        showsUserLocation={true}
                        provider="google"
                    >
                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                coordinate={{
                                    latitude: marker.latitude,
                                    longitude: marker.longitude
                                }}
                                pinColor="blue"
                            >
                            </Marker>
                        ))}
                    </MapView>
                    )}
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    mapContainer: {
        width: "100%",
        height: "100%"
    }
})