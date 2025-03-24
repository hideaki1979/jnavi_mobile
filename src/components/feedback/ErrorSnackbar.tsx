import { Snackbar, useTheme } from "react-native-paper"

interface ErrorSnackbarProps {
    visible: boolean;
    onDismiss: () => void;
    message: string | null;
    duration?: number;
}

/**
 * エラースナックバーを表示するコンポーネント
 * @param visible スナックバーを表示するか否か
 * @param onDismiss スナックバーを閉じたときのコールバック関数
 * @param message 表示するメッセージ
 * @param duration スナックバーの表示時間（ms）。デフォルトは 3000
 */
const ErrorSnackbar: React.FC<ErrorSnackbarProps> = ({
    visible,
    onDismiss,
    message,
    duration = 3000
}) => {
    const theme = useTheme()
    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            duration={duration}
            style={{ backgroundColor: theme.colors.error }
            }
        >
            {message}
        </Snackbar>
    )
}

export default ErrorSnackbar