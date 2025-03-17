import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from "react-native-paper"

// 黄色ベースのカラーパレット
const yellowColors = {
    primary: '#FFB800', // メインカラー（濃い黄色）
    onPrimary: '#000000', // プライマリー上のテキスト色
    primaryContainer: '#FFF9E6', // プライマリーを含むコンテナ
    onPrimaryContainer: '#594800', // プライマリーコンテナ上のテキスト色
    secondary: '#F9A825', // セカンダリーカラー
    onSecondary: '#000000', // セカンダリー上のテキスト色
    secondaryContainer: '#FFF3BF', // セカンダリーを含むコンテナ
    onSecondaryContainer: '#4D3800', // セカンダリーコンテナ上のテキスト色
    tertiary: '#E65100', // 第三のカラー
    onTertiary: '#FFFFFF', // 第三の色上のテキスト色
    tertiaryContainer: '#FFE0B2', // 第三の色を含むコンテナ
    onTertiaryContainer: '#4D2000', // 第三の色コンテナ上のテキスト色
    error: '#B3261E', // エラー色
    onError: '#FFFFFF', // エラー上のテキスト色
    errorContainer: '#F9DEDC', // エラーを含むコンテナ
    onErrorContainer: '#410E0B', // エラーコンテナ上のテキスト色
    background: '#FFFBFF', // 背景色
    onBackground: '#1C1B1F', // 背景上のテキスト色
    surface: '#FFFBFF', // サーフェス色
    onSurface: '#1C1B1F', // サーフェス上のテキスト色
    surfaceVariant: '#F5F0E0', // サーフェスのバリエーション
    onSurfaceVariant: '#49454F', // サーフェスバリエーション上のテキスト色
    outline: '#79747E', // アウトライン色
    outlineVariant: '#CAC4D0', // アウトラインのバリエーション
    shadow: '#000000', // 影の色
    scrim: '#000000', // スクリム（半透明オーバーレイ）の色
    inverseSurface: '#303033', // 反転サーフェス色
    inverseOnSurface: '#F4EFF4', // 反転サーフェス上のテキスト色
    inversePrimary: '#FFE176', // 反転プライマリー色
    elevation: {
        level0: 'transparent',
        level1: '#F8F3F7',
        level2: '#F3EEF2',
        level3: '#EFE9ED',
        level4: '#EDE8EC',
        level5: '#E9E4E8'
    },
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(50, 47, 55, 0.4)'
}

// 黄色ベースのダークテーマカラー
const yellowDarkColors = {
    primary: '#FFD54F', // メインカラー（明るい黄色）
    onPrimary: '#000000', // プライマリー上のテキスト色
    primaryContainer: '#5D4D00', // プライマリーを含むコンテナ
    onPrimaryContainer: '#FFECB3', // プライマリーコンテナ上のテキスト色
    secondary: '#FFB300', // セカンダリーカラー
    onSecondary: '#000000', // セカンダリー上のテキスト色
    secondaryContainer: '#704D00', // セカンダリーを含むコンテナ
    onSecondaryContainer: '#FFE082', // セカンダリーコンテナ上のテキスト色
    tertiary: '#FF9800', // 第三のカラー
    onTertiary: '#000000', // 第三の色上のテキスト色
    tertiaryContainer: '#7A4600', // 第三の色を含むコンテナ
    onTertiaryContainer: '#FFCC80', // 第三の色コンテナ上のテキスト色
    error: '#F44336', // エラー色
    onError: '#FFFFFF', // エラー上のテキスト色
    errorContainer: '#640D0D', // エラーを含むコンテナ
    onErrorContainer: '#FFCDD2', // エラーコンテナ上のテキスト色
    background: '#1C1B1F', // 背景色
    onBackground: '#E6E0E9', // 背景上のテキスト色
    surface: '#1C1B1F', // サーフェス色
    onSurface: '#E6E0E9', // サーフェス上のテキスト色
    surfaceVariant: '#46403C', // サーフェスのバリエーション
    onSurfaceVariant: '#CAC4D0', // サーフェスバリエーション上のテキスト色
    outline: '#938F99', // アウトライン色
    outlineVariant: '#444246', // アウトラインのバリエーション
    shadow: '#000000', // 影の色
    scrim: '#000000', // スクリム（半透明オーバーレイ）の色
    inverseSurface: '#E6E0E9', // 反転サーフェス色
    inverseOnSurface: '#1C1B1F', // 反転サーフェス上のテキスト色
    inversePrimary: '#9C7700', // 反転プライマリー色
    elevation: {
        level0: 'transparent',
        level1: '#242427',
        level2: '#27272A',
        level3: '#2A2A2D',
        level4: '#2C2C2F',
        level5: '#2E2E31'
    },
    surfaceDisabled: 'rgba(230, 224, 233, 0.12)',
    onSurfaceDisabled: 'rgba(230, 224, 233, 0.38)',
    backdrop: 'rgba(50, 47, 55, 0.4)'
}

// ライトテーマの設定
export const lightTheme: MD3Theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...yellowColors
    }
}

// ダークテーマの設定
export const darkTheme: MD3Theme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...yellowDarkColors
    }
}

export default lightTheme