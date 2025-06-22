# J-Navi（二郎・二郎系情報アプリ）

## 概要

J-Navi は、ラーメン二郎および二郎系ラーメン店の情報を提供するモバイルアプリです。店舗の位置情報、営業時間、トッピング・コール情報を簡単に確認できます。React Native と Expo を使用して開発された、iOS と Android の両プラットフォームに対応したクロスプラットフォームアプリケーションです。

## 特徴

- 店舗の位置情報を地図上に表示（React Native Maps 活用）
- 営業時間や定休日の確認
- 店舗のコール・トッピング情報の確認
- トッピング・コールのシミュレーション機能

## 技術スタック

- **フロントエンド**: React Native, TypeScript, Expo
- **UI ライブラリ**: React Native Paper
- **状態管理**: Zustand
- **フォーム管理**: React Hook Form
- **アニメーション**: React Native Reanimated, React Native Gesture Handler
- **地図機能**: React Native Maps

## インストールと実行手順

### 前提条件

- Node.js（バージョン 22.13.0 以上）
- npm
- Expo CLI
- iOS 開発の場合: Xcode 15 以上
- Android 開発の場合: Android Studio と SDK

### インストール手順

1. リポジトリをクローンします。

   ```sh
   git clone https://github.com/yourusername/jnavi.git
   cd jnavi
   ```

2. 依存関係をインストールします。

   ```sh
   npm install
   # または
   yarn install
   ```

3. 環境変数ファイルを設定します。`.env.example` をコピーして `.env` を作成し、必要な API キーなどを設定します。

   ```sh
   cp .env.example .env
   # その後、.envファイルを編集して必要な環境変数を設定
   ```

4. Expo CLI をインストールしていない場合は、以下のコマンドでインストールします。

   ```sh
   npm install -g expo-cli
   ```

### 実行手順

1. 開発サーバーを起動します。

   ```sh
   npx expo start
   ```

2. 表示された QR コードを Expo Go アプリ（iOS/Android）でスキャンしてアプリを実行します。

3. iOS シミュレータで実行する場合:

   ```sh
   npx expo start --ios
   ```

4. Android エミュレータで実行する場合:

   ```sh
   npx expo start --android
   ```

5. Expo Dev Client を使用して実行する場合:

   ```sh
   npx expo start --dev-client
   ```

## 開発ガイドライン

### コーディング規約

- TypeScript の型定義を徹底し、`any` 型の使用を避ける
- コンポーネントはできるだけ小さく、再利用可能に設計する
- React Native Paper のコンポーネントを優先的に使用する
- 状態管理には Context API を活用する
- 非同期処理では async/await 構文を使用する

### プロジェクト構成

```plaintext
src/
├── components/       # 再利用可能なUI要素
├── screens/          # アプリの各画面
├── navigation/       # ナビゲーション関連
├── services/         # API通信などのサービス
├── hooks/            # カスタムフック
├── contexts/         # Contextを使った状態管理
├── utils/            # ユーティリティ関数
├── types/            # TypeScript型定義
└── assets/           # 画像などの静的リソース
```

## ビルド手順

### 開発ビルド

```sh
eas build --profile development --platform all
```

### プレビュー用ビルド

```sh
eas build --profile preview --platform all
```

### 本番ビルド

```sh
eas build --profile production --platform all
```

## デプロイ手順

### 本番環境へのデプロイ

```sh
eas submit --profile production --platform all
```

### iOS App Store へのデプロイ

```sh
eas submit --platform ios
```

### Google Play Store へのデプロイ

```sh
eas submit --platform android
```

## 貢献ガイドライン

1. 既存のイシューを確認するか、新しいイシューを作成する
2. フォークしてブランチを作成する（`feature/機能名` または `fix/問題名`）
3. コードを変更し、コミットする
4. テストが通ることを確認する
5. プルリクエストを作成する

## トラブルシューティング

- **ビルドエラー**: `node_modules` を削除して再インストールを試す
- **iOS シミュレータの問題**: `npx expo start --clear` でキャッシュをクリアする
- **Android エミュレータの問題**: AVD マネージャーからエミュレータを再起動する
- **Firebase 接続エラー**: `.env` ファイルの API キーを確認する

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は LICENSE ファイルを参照してください。

## 連絡先

質問や提案がある場合は、Issues セクションで新しいイシューを作成するか、プロジェクト管理者にメールでお問い合わせください。
