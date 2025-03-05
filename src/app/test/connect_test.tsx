import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import Constants from 'expo-constants'
import { handleInsert } from '../../api/api'
import styles from '../../styles/styles'
import { StoreInput } from '../../components/common/StoreInput'
import { MainButton } from '../../components/common/MainButton'

export default function ConnectTest() {
    const [inputText, setInputText] = useState<string>('')
    const [result, setResult] = useState<string>('')

    // expo-constants の extra から apiUrl を取得
    const { apiUrl } = Constants.expoConfig?.extra || {}

    const handleSubmit = async () => {
        await handleInsert(inputText, apiUrl, setResult)
    }

    return (
        <View style={styles.container}>
            <StoreInput
                value={inputText}
                placeholder='テキストを入力してください'
                onChangeText={setInputText}
            />
            <View>
                <MainButton
                    title='レコード追加'
                    onPress={handleSubmit}
                />
            </View>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Text>test_citestdayo!!!</Text>
            <Text style={styles.responseText}>{result}</Text>
            <StatusBar style="auto" />
        </View>
    )
}
