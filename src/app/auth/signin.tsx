import HeaderAppBar from "@/src/components/navigation/HeaderAppBar"
import { GoogleSigninButton } from "@react-native-google-signin/google-signin"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { KeyboardAvoidingView, StyleSheet, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { Button, Divider, HelperText, Text, TextInput, useTheme } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from '../../context/AuthProvider'


type FormData = {
    email: string;
    password: string;
}

/**
 * SignInコンポーネント
 * ユーザーがメールアドレスとパスワード、またはGoogleアカウントを使用してサインインするための画面を提供します。
 * - メールアドレスとパスワードを用いたサインイン処理を行い、認証後は店舗マップ画面に遷移します。
 * - Googleアカウントを用いたサインインも可能です。
 * - サインインに成功した場合は、店舗マップ画面に遷移します。
 * - サインインに失敗した場合は、エラーメッセージを表示します。
 * 
 * @returns サインイン画面
 */

const SignIn = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true)

    const { signInWithEmail, signInWithGoogle } = useAuth()

    const { control, handleSubmit, formState: { errors } }
        = useForm<FormData>({
            defaultValues: {
                email: "",
                password: ""
            }
        })

    const theme = useTheme()

    /**
     * メールアドレスとパスワードを用いてサインインするための関数
     * Firebase Authを使用して、メールアドレスとパスワードを使用してサインインを実行します。
     * サインインに成功した場合は、店舗マップ画面に遷移します。
     * サインインに失敗した場合は、エラーメッセージを表示します。
     * @param data サインインフォームに入力された情報
     */
    const onSignIn = async (data: FormData) => {
        try {
            setLoading(true)
            // Firebaseでのメール／パスワード認証
            const uid = await signInWithEmail(data.email, data.password)

            if (uid) {
                // const userData = await getUserByUid(uid)
            }

            // 認証成功後、MAP画面へ遷移
            router.replace(`store/map`)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Google認証を使用してサインインするための関数
     * AuthProviderのGoogle認証メソッドを使用して、Google認証を実行します。
     * サインインに成功した場合は、店舗マップ画面に遷移します。
     * サインインに失敗した場合は、エラーメッセージを表示します。
     */
    const onGoogleSignIn = async () => {
        try {
            setLoading(true)
            // AuthProviderのGoogle認証メソッドを使用
            const uid = await signInWithGoogle()
            if (uid) {
                // const userData = await getUserByUid(uid)
            }
            router.replace(`store/map`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <KeyboardAvoidingView
                style={styles.container}
            >
                <HeaderAppBar
                    title="ログイン"
                    showBackButton={true}
                />
                <StatusBar style={theme.dark ? 'light' : 'dark'} />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        {/* メールアドレス入力 */}
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "メールアドレスを入力してください"
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode="outlined"
                                        label="メールアドレス"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={!!errors.email}
                                        left={<TextInput.Icon icon={'email'} />}
                                        keyboardType="email-address"
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <HelperText type="error">{errors.email.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* パスワード入力 */}
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: "パスワードを入力してください",
                                minLength: {
                                    value: 8,
                                    message: 'パスワードは8文字以上入れて下さい'
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode="outlined"
                                        label="パスワード"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={!!errors.password}
                                        left={<TextInput.Icon icon={'lock'} />}
                                        right={
                                            <TextInput.Icon
                                                icon={secureTextEntry ? 'eye-off' : 'eye'}
                                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                                            />
                                        }
                                        disabled={loading}
                                        secureTextEntry={secureTextEntry}
                                    />
                                    {errors.password && (
                                        <HelperText type="error">{errors.password.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* サインアップボタン */}
                        <Button
                            mode='contained'
                            onPress={handleSubmit(onSignIn)}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            ログイン
                        </Button>
                        <View style={styles.dividerContainer}>
                            <Divider style={styles.divider} bold={true} />
                            <Text style={styles.dividerText}>または</Text>
                            <Divider style={styles.divider} bold={true} />
                        </View>

                        {/* Googleサインアップボタン */}
                        <View style={styles.googleButtonContainer}>
                            <GoogleSigninButton
                                color={theme.dark ? GoogleSigninButton.Color.Light : GoogleSigninButton.Color.Dark}
                                disabled={loading}
                                onPress={onGoogleSignIn}
                                size={GoogleSigninButton.Size.Wide}
                                style={styles.googleButton}
                            />
                        </View>

                        {/* アカウント作成画面へのリンク */}
                        <View style={styles.loginContainer}>
                            <Text>アカウント未登録の場合は</Text>
                            <Button
                                mode="text"
                                onPress={() => router.push('auth/signup')}
                            >
                                サインアップ
                            </Button>
                        </View>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 16
    },
    formContainer: {
        gap: 8
    },
    button: {
        marginVertical: 16
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    divider: {
        flex: 1
    },
    dividerText: {
        marginHorizontal: 16
    },
    googleButtonContainer: {
        alignItems: 'center',
        marginBottom: 16
    },
    googleButton: {
        borderRadius: 8,
        width: "100%",
        height: 48
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default SignIn 