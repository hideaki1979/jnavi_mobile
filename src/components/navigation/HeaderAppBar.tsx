import { router } from "expo-router"
import { Appbar } from "react-native-paper"

type ActionItem = {
    icon: string;
    onPress: () => void;
    size?: number;
}

type HeaderAppBarProps = {
    title: string;
    showBackButton?: boolean;
    titleStyle?: object;
    rightAction?: ActionItem | ActionItem[];
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
                Array.isArray(rightAction) ? (
                    // 複数のアクションを配置する場合は、マップで各アクションを表示
                    rightAction.map((action, index) => (
                        <Appbar.Action
                            key={index}
                            icon={action.icon}
                            size={action.size || 24}
                            onPress={action.onPress}
                        />
                    ))
                )
                    : (
                        // 単一アクションの場合は、そのまま表示
                        <Appbar.Action
                            icon={rightAction.icon}
                            size={rightAction.size || 24}
                            onPress={rightAction.onPress}
                        />
                    )
            )}
        </Appbar.Header>
    )
}