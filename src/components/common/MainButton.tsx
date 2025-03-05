import React, { useState } from "react"
import { Pressable, Text, PressableProps } from "react-native"
import styles from "../../styles/styles"

interface MainButtonProps extends PressableProps {
    title: string
    onPress: () => void
}

export const MainButton: React.FC<MainButtonProps> = ({
    title,
    onPress,
    ...props
}) => {

    const [isHovered, setIsHovered] = useState(false)
    return (
        <Pressable
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
            ]}
            {...props}
        >
            <Text style={[styles.buttonText, isHovered && styles.buttonTextPressed]}>
                {title}
            </Text>
        </Pressable>
    )
}