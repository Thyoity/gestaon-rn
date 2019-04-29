import { AppRegistry, StatusBar, View, ToastAndroid, Text, Button } from 'react-native'
import React, { Component } from 'react'
import { Provider } from "mobx-react"
import Routes from './src/routes'
import Spinner from 'react-native-loading-spinner-overlay'

import stores from './src/stores'

/*import bgMessaging from './src/routes/bg-messaging'*/

import { YellowBox } from 'react-native'
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'])

type Props = {};
class App extends Component<Props> {
    render() {
        return (
            <Provider {...stores}>
                <View style={{ flex: 1 }}>
                    <StatusBar
                        animated={true}
                        backgroundColor={'#1E1E22'}
                        translucent={true}
                        showHideTransition={'fade'}
                    />
                    <Routes></Routes>
                </View>
            </Provider>
        );
    }
}

AppRegistry.registerComponent('GestaON', () => App)


/* when the app is on background */
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => ({data}) => {
    return new Promise((resolve, reject) => {
        if(!!stores.authStore.user){
            if(data.type === 'request.removed'){ // request removed
                stores.requestsStore.removeRequest(parseInt(data.id))
                ToastAndroid.show('Um pedido foi removido de você!', ToastAndroid.SHORT)
            }
            else if(data.type === 'request.create' || data.type === 'request.changeStatus') { // request
                stores.requestsStore.loadRequest(parseInt(data.id)).then((response) => {
                    if(response.operation === 'added'){
                        ToastAndroid.show('O pedido #' + response.requestId + ' foi adicionado na sua lista de pedidos!', ToastAndroid.SHORT)
                    }
                    else {
                        ToastAndroid.show('Houve uma atualização no pedido #' + response.requestId, ToastAndroid.SHORT)
                    }
                })
            }
        }
        return resolve()
    })
})
