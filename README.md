
# J-Navi（二郎・二郎系情報アプリ）

## 概要

J-Naviは、ラーメン二郎および二郎系ラーメン店の情報を提供するアプリです。店舗の位置情報、営業時間、トッピング・コール情報を確認できます。

## 特徴

- 店舗の位置情報を地図上に表示
- 営業時間や定休日の確認
- 店舗のコール・トッピング情報の確認
- トッピング・コールのシミュレーション機能

## インストールと実行手順

### 前提条件

- Node.js（バージョン 22.13.0）
- npmまたはyarn
- Expo CLI

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

3. Expo CLIをインストールしていない場合は、以下のコマンドでインストールします。

    ```sh
    npm install -g expo-cli
    ```

### 実行手順

1. 開発サーバーを起動します。

    ```sh
    npx expo start
    ```

2. 表示されたQRコードをExpo Goアプリ（iOS/Android）でスキャンしてアプリを実行します。

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

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細はLICENSEファイルを参照してください。
