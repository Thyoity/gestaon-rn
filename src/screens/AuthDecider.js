import React, { Component } from 'react'
import { AsyncStorage, ActivityIndicator, StatusBar, View, Image } from 'react-native'
import { create } from 'mobx-persist'
import { inject, observer } from 'mobx-react'

import _ from 'lodash'

import RNLocalStorage from 'react-native-local-storage'

import { version } from '../../package.json'

@inject('authStore','instanceStore','requestsStore')
@observer
export default class AuthDecider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showLoading: true
        }
    }

    // Fetch the token from storage then navigate to our appropriate place
    _decide = () => {
        const vm = this
        return RNLocalStorage.get('auth').then((auth) => {
            const loggedInBefore = _.get(auth, 'accessToken', false) && _.get(auth, 'refreshToken', false)
            if(loggedInBefore){
                vm.props.authStore.setTokens(auth.accessToken, auth.refreshToken)
                vm.props.navigation.navigate('Main')
            }
            else {
                vm.props.navigation.navigate('Auth')
            }
        })
    }

    /*_checkVersion(){
        const vm = this
        AppAPI.getVersion().then(({ android }) => {
            if(android === version){
                vm._bootstrapAsync()
            }
            else {
                this.setState({
                    showLoading: false,
                    currentVersion: version,
                    lastVersion: android
                })
            }
        }).catch(() => {
            ToastAndroid.show("Não foi possível conectar ao servidor, tentando novamente em 10 segundos...", ToastAndroid.SHORT)
            setTimeout(() => {
                vm._checkVersion()
            }, 10000)
        })
    }
    */

    componentDidMount(){
        const vm = this
        const hydrate = create({
            storage: AsyncStorage,
            jsonify: true
        })
        const hydrations = [
            hydrate('user', vm.props.authStore),
            hydrate('requests', vm.props.requestsStore),
            hydrate('serverRequestQueue', vm.props.instanceStore),
            hydrate('showLocation', vm.props.instanceStore)
        ]
        Promise.all(hydrations).then(([user, requests, serverRequestQueue]) => {
            // vm.props.requestsStore.requests = []
            vm._decide()
        })

    }

    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="default" />
                <Image style={{ height: 80, marginBottom: 20 }} resizeMode="contain" source={require('../assets/img/logo-condensed.png')} />
                <ActivityIndicator size={50} />
                { /* this.state.showLoading ? <ActivityIndicator size={50} /> : (
                    <View style={{ display: 'flex', flexDirection: 'column', width: 240, marginTop: 20 }}>
                        <Text style={{ marginBottom: 20, textAlign: 'center' }}>Seu app do GestaON (v{this.state.currentVersion}) está desatualizado!</Text>
                        <Text style={{ marginBottom: 40, textAlign: 'center' }}>Para continuar, você deve atualiza-lo para versão mais recente.</Text>
                        <Button title={'Atualizar para v' + this.state.lastVersion} onPress={() => {
                            Linking.openURL("market://details?id=com.gestaon")
                        }} />
                    </View>
                    ) */ }
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
}