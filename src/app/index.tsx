import { Redirect } from 'expo-router'
import { PaperProvider } from 'react-native-paper'

export default function Index() {
    return (
        <PaperProvider>
            {/* <Redirect href="/store/detail?id=8" /> */}
            {/* <Redirect href="/store/create" /> */}
            <Redirect href="/store/map" />
        </PaperProvider>
    )
}