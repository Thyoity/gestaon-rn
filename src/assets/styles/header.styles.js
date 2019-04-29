import { StyleSheet } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'

const styles = StyleSheet.create({
    outerContainerStyles: {
        height: 50 + getStatusBarHeight(),
        paddingTop: getStatusBarHeight()
    },
})

export default styles