/// <reference types="node" />

declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_API_URL: string;
        EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    }
}