import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10
    },
    responseText: {
        textAlign: 'center',
        marginTop: 20
    },
    button: {
        width: '50%',
        backgroundColor: '#fff',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10
    },
    buttonPressed: {
        backgroundColor: '#808080',
        transform: [{ scale: 0.98 }]
    },
    buttonText: {
        color: '#000'
    },
    buttonTextPressed: {
        color: '#fff'
    }
})

export default styles