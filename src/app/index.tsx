import { Redirect } from 'expo-router'
import * as React from 'react'
import { PaperProvider } from 'react-native-paper'

export default function Index() {
    return (
        <PaperProvider>
            <Redirect href="/store/create" />
        </PaperProvider>
    )
}