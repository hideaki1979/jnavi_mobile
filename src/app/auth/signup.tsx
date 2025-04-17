import { firebaseAuth } from '@/src/config/firebase'
import { router } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Divider, HelperText, Text, TextInput, useTheme } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'
import HeaderAppBar from '@/src/components/navigation/HeaderAppBar'
import { ScrollView } from 'react-native-gesture-handler'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { createUser } from '@/src/api/AuthApi'
import { GoogleAuthProvider } from '@react-native-firebase/auth'

type FormData = {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Signup = () => {
    const [loading, setLoading] = useState(false)
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const [confirmSecureTextEntry, setConfirmSecureEntry] = useState(true)

    const { control, handleSubmit, watch, formState: { errors } }
        = useForm<FormData>({
            defaultValues: {
                userName: '',
                email: '',
                password: '',
                confirmPassword: ''
            }
        })

    const theme = useTheme()

    // 入力値の監視
    const password = watch('password')

    // メール・パスワードでサインアップ
    const onSignup = async (data: FormData) => {
        try {
            setLoading(true)
            // Firebaseパスワード認証
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(data.email, data.password)
            const user = userCredential.user

            // ユーザープロファイルの更新（ユーザー名）
            await user.updateProfile({ displayName: data.userName })
            console.log('認証情報：', user)

            await createUser({
                uid: user.uid,
                email: data.email,
                displayName: data.userName,
                authProvider: 'email'
            })
            console.log("サインアップ（パスワード認証）成功！")
            router.replace('store/map')
        } catch (error) {
            console.error('サインアップエラー：', error)

            // エラーメッセージの設定
            let errorMessage = 'アカウント作成に失敗しました。管理者に問い合わせしてください'
            // Firebase Authエラーの場合
            if (typeof error === 'object' && error !== null && 'code' in error) {
                switch (error.code) {
                    case 'auth/email-already-exists':
                        errorMessage = 'このメールアドレスは既に登録されています'
                        break
                    case 'auth/invalid-email':
                        errorMessage = '有効なメールアドレスを入力してください'
                        break
                    case 'auth/invalid-password':
                        errorMessage = '有効なパスワードを入力してください'
                        break
                    default:
                        errorMessage = `アカウント作成に失敗しました。ErrorCode： ${error.code}`
                        break
                }
            }
            Alert.alert(
                'サインアップエラー',
                errorMessage,
                [{ text: 'OK' }]
            )
        } finally {
            setLoading(false)
        }
    }

    // Google認証でサインアップ
    const onGoogleSignup = async () => {
        try {
            setLoading(true)

            // 既存のGoogleセッションをチェックして強制的にクリア
            const isGoogleSignIn = await GoogleSignin.hasPreviousSignIn()
            if (isGoogleSignIn) {
                await GoogleSignin.signOut()
            }
            // Google認証サインアップ
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
            console.log('PlayServices確認完了')
            const signinResult = await GoogleSignin.signIn()
            console.log('Googleサインイン完了', signinResult)
            const idToken = signinResult.data?.idToken

            if (!idToken) {
                throw new Error('Google認証トークンIDがありません')
            }
            console.log('IDトークン取得完了')

            // Firebaseクレデンシャル作成
            const googleCredential = GoogleAuthProvider.credential(idToken)
            console.log('Googleクレデンシャル作成完了')

            // Firebase認証
            const userCredential = await firebaseAuth.signInWithCredential(googleCredential)
            console.log('Firebase認証完了')
            const user = userCredential.user
            console.log('ユーザー情報取得完了', user.uid)

            await createUser({
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                authProvider: 'google'
            })

            console.log('Google認証でのユーザー登録成功しました！')
            router.replace('store/map')

        } catch (error) {
            console.error('Google認証サインアップエラー：', error)
            Alert.alert(
                'Google認証サインアップエラー',
                'Googleアカウント認証でのサインアップに失敗しました。',
                [{ text: 'OK' }]
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={[]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 32}
                style={styles.container}
            >
                <HeaderAppBar
                    title='アカウント作成'
                    showBackButton={true}
                />
                <StatusBar style={theme.dark ? 'light' : 'dark'} />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        {/* ユーザー名入力 */}
                        <Controller
                            control={control}
                            name="userName"
                            rules={{
                                required: 'ユーザー名を入力してください'
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode='outlined'
                                        label='ユーザー名'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        left={<TextInput.Icon icon='account' />}
                                        error={!!errors.userName}
                                        disabled={loading}
                                    />
                                    {errors.userName && (
                                        <HelperText type='error'>{errors.userName.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* メールアドレス入力 */}
                        <Controller
                            control={control}
                            name='email'
                            rules={{
                                required: 'メールアドレスを入力してください',
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: '有効なメールアドレスを入力してください'
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode='outlined'
                                        label='メールアドレス'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType='email-address'
                                        left={<TextInput.Icon icon={'email'} />}
                                        error={!!errors.email}
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <HelperText type='error'>{errors.email?.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* パスワード入力 */}
                        <Controller
                            control={control}
                            name='password'
                            rules={{
                                required: 'パスワードを入力してください',
                                minLength: {
                                    value: 8,
                                    message: 'パスワードは8文字以上入力してください'
                                }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode='outlined'
                                        label='パスワード'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={secureTextEntry}
                                        left={<TextInput.Icon icon="lock" />}
                                        right={
                                            <TextInput.Icon
                                                icon={secureTextEntry ? 'eye-off' : 'eye'}
                                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                                            />
                                        }
                                        error={!!errors.password}
                                        disabled={loading}
                                    />
                                    {errors.password && (
                                        <HelperText type='error'>{errors.password.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* パスワード確認入力 */}
                        <Controller
                            control={control}
                            name='confirmPassword'
                            rules={{
                                required: 'パスワードを再入力してください',
                                validate: value =>
                                    value === password || 'パスワードが一致してません'
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <>
                                    <TextInput
                                        mode='outlined'
                                        label='パスワード（再入力）'
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={confirmSecureTextEntry}
                                        left={<TextInput.Icon icon="lock-check" />}
                                        right={
                                            <TextInput.Icon
                                                icon={confirmSecureTextEntry ? 'eye-off' : 'eye'}
                                                onPress={() => setConfirmSecureEntry(!confirmSecureTextEntry)}
                                            />
                                        }
                                        error={!!errors.confirmPassword}
                                        disabled={loading}
                                    />
                                    {errors.confirmPassword && (
                                        <HelperText type='error'>{errors.confirmPassword.message}</HelperText>
                                    )}
                                </>
                            )}
                        />
                        {/* サインアップボタン */}
                        <Button
                            mode='contained'
                            onPress={handleSubmit(onSignup)}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            新規登録
                        </Button>

                        <View style={styles.dividerContainer}>
                            <Divider style={styles.divider} />
                            <Text style={styles.dividerText}>または</Text>
                            <Divider style={styles.divider} />
                        </View>

                        {/* Googleサインアップボタン */}
                        <Button
                            mode='outlined'
                            onPress={onGoogleSignup}
                            disabled={loading}
                            icon={() => <MaterialCommunityIcons size={20} name='google' color="'#1523ef'" />}
                            style={styles.googleButton}
                        >
                            Googleでサインアップ
                        </Button>
                        {/* ログイン画面へのリンク */}
                        <View style={styles.loginContainer}>
                            <Text>既にアカウントをお持ちの場合は</Text>
                            <Button
                                mode='text'
                                onPress={() => router.push('auth/signin')}
                            >
                                ログイン
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
        width: '100%',
        gap: 8
    },
    button: {
        marginTop: 16,
        padding: 4
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    divider: {
        flex: 1,
        height: 2
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#757575'
    },
    googleButton: {
        marginBottom: 16,
        borderColor: '#1523ef'
    },
    googleButtonContent: {
        paddingVertical: 4
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Signup