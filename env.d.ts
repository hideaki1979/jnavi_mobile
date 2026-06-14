/// <reference types="node" />

declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_API_URL: string;
        // ビルド時のみ参照(app.config.ts)。JS バンドルに埋め込まないため EXPO_PUBLIC_ を付けない
        GOOGLE_MAPS_API_KEY: string;
        EXPO_PUBLIC_FIREBASE_API_KEY: string;
    }
}