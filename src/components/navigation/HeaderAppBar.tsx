import { router } from "expo-router"
import { Appbar } from "react-native-paper"

type HeaderAppBarProps = {
    title: string;
    showBackButton?: boolean;
    titleStyle?: object;
    rightAction?: {
        icon: string
        onPress: () => void
        size?: number
    };
}

/**
 * アプリ全体で使用する共通のヘッダーナビゲーションバー
 */
export default function HeaderAppBar({
    title,
    showBackButton = true,
    titleStyle,
    rightAction
}: HeaderAppBarProps) {
    return (
        <Appbar.Header>
            {showBackButton && <Appbar.BackAction onPress={() => router.back()} />}
            <Appbar.Content
                title={title}
                titleStyle={titleStyle || { fontSize: 16, fontWeight: "bold" }}
            />
            {rightAction && (
                <Appbar.Action
                    icon={rightAction.icon}
                    size={rightAction.size || 24}
                    onPress={rightAction.onPress}
                />
            )}
        </Appbar.Header>
    )
}