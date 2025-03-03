import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

export default function App() {
  const [inputText, setInputText] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  // expo-constants の extra から apiUrl を取得
  const { apiUrl } = Constants.expoConfig?.extra || {};

  const handleInsert = async (): Promise<void> => {
    if (!apiUrl) {
      setResult('apiUrlが設定されていません');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/insert`, {
        value: inputText
      })
      setResult(JSON.stringify(response.data));
    } catch (error) {
      console.error("insertError：", error);
      if (axios.isAxiosError(error)) {
        setResult('登録処理時にエラー発生しました。' + JSON.stringify(error.response?.data));
      } else {
        setResult('登録処理時に想定外のエラー発生しました。');
      }
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputText}
        placeholder="テキストを入力してください"
        onChangeText={setInputText}
      />
      <View>
        <Pressable
          onPressIn={() => setIsHovered(true)}
          onPressOut={() => setIsHovered(false)}
          onPress={handleInsert}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={[
            styles.buttonText,
            isHovered && styles.buttonTextPressed
          ]}>
            レコード追加
          </Text>
        </Pressable>
      </View>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Text>testtesttest_citestdayo!!!</Text>
      <Text style={styles.responseText}>{result}</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  responseText: {
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    width: '50%',
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  buttonPressed: {
    backgroundColor: '#808080',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#000',
  },
  buttonTextPressed: {
    color: '#fff',
  },
});

