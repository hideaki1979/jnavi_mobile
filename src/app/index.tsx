import { Redirect } from 'expo-router'

export default function Index() {
    return (
        <>
            {/* <Redirect href="/store/detail?id=8" /> */}
            {/* <Redirect href="/store/create" /> */}
            <Redirect href="/store/map" />
        </>
    )
}