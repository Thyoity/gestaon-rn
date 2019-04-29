import _ from 'lodash'

import React, { Component } from 'react'

import { ScrollView, ToastAndroid, View, Text, Dimensions, Image, ActivityIndicator, Linking } from 'react-native'
import { DrawerItems, SafeAreaView } from 'react-navigation'
import { Button, Icon, CheckBox } from 'react-native-elements'
import Spinner from 'react-native-loading-spinner-overlay'
import Overlay from 'react-native-modal-overlay'

import { inject, observer } from 'mobx-react'

import { getStatusBarHeight } from 'react-native-status-bar-height'
import firebase, {RemoteMessage} from 'react-native-firebase'

import AppAPI from '../../api/app'
import { version } from '../../../package.json'

import config from '../../config'

@inject('authStore','instanceStore','requestsStore')
@observer
export default class NavigationDrawer extends Component {
    constructor(props){
        super(props)
        this.state = {
            firstConnection: true
        }
        this._requestQueueInterval = null
        const garanteeNotificationPermission = () => {
            firebase.messaging().hasPermission().then(enabled => {
                if(!enabled){
                    // user doesn't have permission
                    console.log("Don't have notification permissions")
                    firebase.messaging().requestPermission()
                        .then(() => {
                            garanteeNotificationPermission()
                        })
                        .catch(error => {
                            garanteeNotificationPermission()
                        })
                }
            })
        }
        garanteeNotificationPermission()
    }

    _loadRequests(){
        const vm = this
        vm.props.requestsStore.loadRequests().then(() => {
            if(vm.state.firstConnection) {
                vm.setState({
                    firstConnection: false
                })
                // get and set current user
                vm.props.authStore.getUser()
                // if the app was opened through a notification click, and app was closed, after requests load, execute this:
                firebase.notifications().getInitialNotification().then((notificationOpen) => {
                    if (notificationOpen) {
                        const data = notificationOpen.notification.data
                        if (data.type === 'request.changeStatus' || data.type === 'request.create') {
                            const request = _.find(vm.props.requestsStore.requests, {id: parseInt(data.id)})
                            if (request) {
                                this.props.requestsStore.activeRequestId = parseInt(data.id)
                            }
                        }
                        else if (data.type === 'request.chat') {
                            const request = _.find(this.props.requestsStore.requests, {id: parseInt(data.id)})
                            if (request) {
                                this.props.requestsStore.activeRequestId = parseInt(data.id)
                                this.props.requestsStore.showChatTab = true
                            }
                        }
                    }
                })
            }
        })
    }

    componentDidMount() {
        const vm = this

        vm._requestQueueInterval = setInterval(() => {
            if(vm.props.instanceStore.connection === 'connected' && vm.props.instanceStore.serverRequestQueue.length){
                console.log("Sincronizando fila de requisições")
                AppAPI.syncServerRequestQueue(vm.props.instanceStore.serverRequestQueue).then((response) => {
                    vm._loadRequests()
                })
                vm.props.instanceStore.serverRequestQueue = []
            }
            else if(vm.props.instanceStore.connection !== 'connected' && vm.props.instanceStore.serverRequestQueue.length) {
                console.log("Há requisições na fila. Aguardando conexão com a Internet.")
            }
            else if(!vm.props.instanceStore.serverRequestQueue.length) {
                console.log("Sem requisições na fila.")
            }
        }, 3000)


        vm.props.instanceStore.loadSound()
        vm.props.instanceStore.loadIO()

        vm.props.instanceStore.socket.on('reconnect_attempt', (attemptNumber) => {
            vm.props.instanceStore.connection = 'trying-reconnection'
        })
        vm.props.instanceStore.socket.on('disconnect', (reason) => {
            vm.props.instanceStore.connection = 'disconnected'
        })
        vm.props.instanceStore.socket.on('reconnect', (reason) => {
            vm.props.instanceStore.connection = 'connected'
        })
        vm.props.instanceStore.socket.on('connect', () => {
            vm.props.instanceStore.connection = 'connected'
            vm._loadRequests()
        })
        vm.props.instanceStore.socket.on('version', (ev) => {
            if(ev.success){
                vm.props.instanceStore.lastServerVersion = ev.evData.android
            }
        })
        vm.props.instanceStore.socket.on('request:unreadChatItemCountUpdate', this._requestUnreadChatItemCountUpdate)
        // app is in the foreground
        this._messageListener = firebase.messaging().onMessage((message) => {
            // process data only if it is authenticated
            if(!!this.props.authStore.user){

                console.log("Something received here", message)

                const data = message.data

                if(data.type === 'request.removed'){ // request removed
                    this.props.requestsStore.removeRequest(parseInt(data.id))
                    ToastAndroid.show('Um pedido foi removido de você!', ToastAndroid.SHORT)
                    vm.props.instanceStore.sounds.deny1.play()
                }
                else if(data.type === 'request.create' || data.type === 'request.changeStatus') { // request
                    this.props.requestsStore.loadRequest(parseInt(data.id)).then((response) => {
                        if(response.operation === 'added'){
                            ToastAndroid.show('O pedido #' + response.requestId + ' foi adicionado na sua lista de pedidos!', ToastAndroid.SHORT)
                            vm.props.instanceStore.sounds.sound1.play()
                        }
                        else {
                            ToastAndroid.show('Houve uma atualização no pedido #' + response.requestId, ToastAndroid.SHORT)
                            vm.props.instanceStore.sounds.sound1.play()
                        }
                    })
                }
                else if(data.type === 'request.chat'){
                    if(data.itemType === 'alert'){
                        vm.props.instanceStore.sounds.horn1.play()
                    }
                    else {
                        vm.props.instanceStore.sounds.message1.play()
                    }
                }
            }
        })
        // app was on background and was opened clicking the notification
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            // process data only if it is authenticated
            if(!!this.props.authStore.user) {
                const data = notificationOpen.notification.data;
                if (data.type === 'request.changeStatus' || data.type === 'request.create') {
                    const request = _.find(this.props.requestsStore.requests, {id: parseInt(data.id)})
                    if (request) {
                        this.props.requestsStore.activeRequestId = parseInt(data.id)
                        this.props.requestsStore.showChatTab = false
                    }
                }
                else if(data.type === 'request.chat'){
                    const request = _.find(this.props.requestsStore.requests, {id: parseInt(data.id)})
                    if (request) {
                        this.props.requestsStore.activeRequestId = parseInt(data.id)
                        this.props.requestsStore.showChatTab = true
                    }
                }
            }
        })
    }

    componentWillUnmount() {
        this.props.instanceStore.socket.removeListener('request:unreadChatItemCountUpdate', this._requestUnreadChatItemCountUpdate)
        this.notificationDisplayedListener()
        this.notificationListener()
        this.notificationOpenedListener()
        this._messageListener()
        if(!!this._requestQueueInterval) clearInterval(this._requestQueueInterval)
    }

    render(){
        return (
            <ScrollView>
                <Overlay visible={ !this.props.instanceStore.lastServerVersion || (version !== this.props.instanceStore.lastServerVersion) }
                         closeOnTouchOutside={ false }
                         animationType="zoomIn"
                         containerStyle={{backgroundColor: 'rgba(10, 10, 10, .9)'}}
                         childrenWrapperStyle={{backgroundColor: '#eee'}}
                         animationDuration={500}>
                    { this.props.instanceStore.lastServerVersion ? (<View style={{display: 'flex', flexDirection: 'column'}}>
                            <Image style={{ height: 40, marginBottom: 20 }} resizeMode="contain" source={require('../../assets/img/logo-condensed.png')} />
                            <Text style={{ marginBottom: 20, textAlign: 'center' }}>Seu app do GestaON (v{version}) está desatualizado!</Text>
                            <Text style={{ marginBottom: 40, textAlign: 'center' }}>Para continuar, você deve atualiza-lo para versão mais recente.</Text>
                            <Button title={'Atualizar para v' + this.props.instanceStore.lastServerVersion} onPress={() => {
                                Linking.openURL("market://details?id=com.gestaon")
                            }} />
                        </View>) : <ActivityIndicator size={50} />
                    }

                </Overlay>
                <Overlay visible={this.props.instanceStore.overlay.show}
                    closeOnTouchOutside={ config.development }
                    animationType="zoomIn"
                    containerStyle={{backgroundColor: 'rgba(10, 10, 10, .9)'}}
                    childrenWrapperStyle={{backgroundColor: '#eee'}}
                    onClose={() => {
                     this.props.instanceStore.hideOverlay()
                    }}
                    animationDuration={500}>
                    <Image style={{ height: 40, marginBottom: 20 }} resizeMode="contain" source={require('../../assets/img/logo-condensed.png')} />
                    <Text style={{ marginBottom: 10 }}>{ this.props.instanceStore.overlay.message }</Text>
                    <ActivityIndicator size={30} />
                </Overlay>
                <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
                    <View style={{display: 'flex', height: 120, maxHeight: 120, backgroundColor: "#FFF", flexDirection: 'column', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 15}}>
                        <Text style={{fontSize: 20, marginBottom: 5}}>{(this.props.authStore.user) ? this.props.authStore.user.name : '---'}</Text>
                        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <Text>Estado da conexão { this.props.authStore.userSettings }: </Text>
                            <Icon
                                type="material-community"
                                size={18}
                                name={ (this.props.instanceStore.connection === 'disconnected') ? 'lan-disconnect' : ((this.props.instanceStore.connection === 'connected') ? 'lan-connect' : 'lan-pending') }
                                color={ (this.props.instanceStore.connection === 'disconnected') ? '#e0422a' : ((this.props.instanceStore.connection === 'connected') ? '#50e3c2' : '#D8B132') }
                            />
                        </View>
                    </View>
                    <View style={{ flexGrow: 1 }}>
                        { !this.props.instanceStore.overlay.show && (
                            <DrawerItems {...this.props} />
                        ) }
                    </View>
                    {/*<View style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end' }}>
                        <CheckBox
                            title='Tarzan notif sound.'
                            checked={false}
                            onPress={() => {
                                const tarzanUserSetting = _.find(this.props.authStore.userSettings, {name: 'sound'})
                                if(tarzanUserSetting){
                                    if(tarzanUserSetting.value === 'tarzan'){
                                        this.props.authStore.setMySetting('sound',null)
                                    }
                                    else {
                                        this.props.authStore.setMySetting('sound','tarzan')
                                    }

                                }
                                else {
                                    this.props.authStore.setMySetting('sound','tarzan')
                                }
                            }}
                        />
                    </View>*/}
                    <Button
                        fontFamily='Lato'
                        buttonStyle={{ height: 36, margin: 20  }}
                        onPress={this._logout}
                        title='DESCONECTAR'
                    />
                </SafeAreaView>
            </ScrollView>
        )
    }
    _logout = () => {
        const vm = this
        if(vm.props.authStore.user){
            vm.props.authStore.logout().then(() => {
                vm.props.navigation.navigate('Auth')
            })
        }
    }

    _requestUnreadChatItemCountUpdate = (ev) => {
        if(ev.success){
            this.props.requestsStore.setRequestUnreadChatItemCount(ev.evData.requestId, ev.evData.unreadChatItemCount)
        }
        console.log("Received request:unreadChatItemCountUpdate", ev)
    }

}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: Dimensions.get('window').height,
        paddingTop: getStatusBarHeight()
    }
}