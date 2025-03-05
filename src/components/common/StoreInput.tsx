import React from "react"
import { TextInput, TextInputProps } from "react-native"
import styles from "../../styles/styles"

interface StoreInputProps extends TextInputProps {
    value: string
    onChangeText: (value: string) => void
}

export const StoreInput: React.FC<StoreInputProps> = ({
    value,
    onChangeText,
    ...props
}) => {
    return (
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            {...props}
        />
    )
}