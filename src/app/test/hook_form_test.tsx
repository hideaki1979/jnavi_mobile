import { router } from "expo-router"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, StyleSheet, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"

// フォームデータの型定義
type FormData = {
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * HookFormTestコンポーネント
 * 
 * このコンポーネントは、React Hook Formを使用してユーザー登録フォームを提供します。
 * フォームには、メールアドレス、パスワード、パスワード確認の3つのフィールドが含まれています。
 * - メールアドレス：必須、メールアドレス形式である必要があります。
 * - パスワード：必須、8文字以上で英大文字、英小文字、数字を含む必要があります。
 * - パスワード確認：必須、パスワードと一致する必要があります。
 * 
 * フォーム送信時には、入力データがコンソールに出力され、`Alert`で送信成功メッセージが表示されます。
 * また、`reset`関数でフォームがリセットされます。
 * 
 * @returns ユーザー登録フォームを含むReact要素
 */
const HookFormTest = () => {
    // パスワードのマスク表示
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true)

    // React-Hook-Form初期設定
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm<FormData>({
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    // confirmPasswordのバリデーションのためにpasswordフィールドを監視
    const password = watch('password')

    /**
     * フォーム送信時の処理
     * フォームに入力された情報をconsoleに出力し、`Alert`で送信成功メッセージを表示します。
     * また、`reset`関数でフォームを初期状態にリセットします。
     * 
     * @param data - フォームに送信されたデータ
     */
    const onSubmit = (data: FormData) => {
        console.log('フォーム送信データ：', data)
        // APIなどで呼び出してユーザー情報を登録
        Alert.alert('送信成功しました。')
        reset()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ユーザー登録</Text>
            <Controller
                control={control}
                name='email'
                rules={{
                    required: 'メールアドレスは必須項目です',
                    pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'メールアドレスの形式で入力してください'
                    }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                        <TextInput
                            label='email'
                            mode='outlined'
                            keyboardType="email-address"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.email}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="email" />}
                        />
                        {errors.email && (
                            <HelperText type="error">{errors.email.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <Controller
                control={control}
                name="password"
                rules={{
                    required: 'パスワードは必須です',
                    minLength: {
                        value: 8,
                        message: 'パスワードは８文字以上入力してください'
                    },
                    pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                        message: 'パスワードは英大文字、英小文字、数字を含む必要があります'
                    }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                        <TextInput
                            label="password"
                            mode="outlined"
                            secureTextEntry={secureTextEntry}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.password}
                            left={<TextInput.Icon icon='lock' />}
                            right={
                                <TextInput.Icon
                                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                                />
                            }
                        />
                        {errors.password && (
                            <HelperText type="error">{errors.password.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <Controller
                control={control}
                name="confirmPassword"
                rules={{
                    required: 'パスワード（確認）は必須です',
                    validate: (value) => value === password || 'パスワードが一致してません'
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputContainer}>
                        <TextInput
                            label="password(confirm)"
                            mode="outlined"
                            secureTextEntry={confirmSecureTextEntry}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            error={!!errors.confirmPassword}
                            left={<TextInput.Icon icon='lock' />}
                            right={
                                <TextInput.Icon
                                    icon={confirmSecureTextEntry ? 'eye-off' : 'eye'}
                                    onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                                />
                            }
                        />
                        {errors.confirmPassword && (
                            <HelperText type="error">{errors.confirmPassword.message}</HelperText>
                        )}
                    </View>
                )}
            />
            <View style={styles.buttonContainer}>
                <Button
                    mode='contained'
                    onPress={handleSubmit(onSubmit)}
                    style={styles.button}
                >
                    送信
                </Button>
                <Button
                    mode='outlined'
                    onPress={() => router.back()}
                    style={styles.button}
                >
                    戻る
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 48,
        paddingHorizontal: 16

    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16
    },
    inputContainer: {
        marginBottom: 8
    },
    buttonContainer: {
        marginTop: 16
    },
    button: {
        marginBottom: 16,
        padding: 4
    }
})

export default HookFormTest