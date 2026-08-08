/**
 * express-validator が返すフィールド単位のエラー情報
 * （API 側 handleValidationErrors が詰める details 配列の要素に対応）
 *
 * value は `.trim()` サニタイザ適用後の値が入るため、
 * 送信した値とは一致しないことがある（"   " を送ると "" が返る）。
 */
export interface ApiErrorDetail {
    type?: string;
    value?: unknown;
    msg: string;
    path: string;
    location?: string;
}

/**
 * API のエラーレスポンスボディ。出所によって3形状あり、
 * メッセージが入るキーが `error` と `message` で異なる。
 *
 * - バリデーションミドルウェア: `{ success, error, details[] }`
 * - サービス層（AppError）    : `{ success, error }`
 * - 認証ミドルウェア          : `{ status, message }`
 */
export interface ApiErrorResponse {
    success?: boolean;
    error?: string;
    details?: ApiErrorDetail[];
    status?: string;
    message?: string;
}
