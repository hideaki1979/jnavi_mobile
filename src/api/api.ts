import axios from "axios"

export const handleInsert = async (
    InputText: string,
    apiUrl: string | undefined,
    setResult: (result: string) => void
): Promise<void> => {
    if (!apiUrl) {
        setResult('apiUrlが設定されてません！')
        return
    }

    try {
        const response = await axios.post(`${apiUrl}/insert`, {
            value: InputText
        })
        setResult(JSON.stringify(response.data))
    } catch (error) {
        console.error("insertError：", error)
        if (axios.isAxiosError(error)) {
            setResult('登録処理時にエラーが発生しました。' + JSON.stringify(error.response?.data))
        } else {
            setResult('登録処理時に想定外のエラーが発生しました。')
        }
    }
}