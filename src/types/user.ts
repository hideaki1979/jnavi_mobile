// ユーザー型定義
export interface User {
    uid: string;
    email: string;
    displayName: string;
    authProvider?: string;
}

// 認証コンテキストの型定義
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}