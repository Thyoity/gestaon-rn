import { observable, action, computed } from 'mobx'
import { ToastAndroid } from 'react-native'
import RNLocalStorage from 'react-native-local-storage'
import _ from 'lodash'
import config from '../../config/index'
import Sound from 'react-native-sound'
import { persist } from 'mobx-persist'

import stores from '../../stores/index'

class InstanceStore {
    @persist @observable lastServerVersion = false
    @persist('list') @observable serverRequestQueue = []
    @persist @observable showLocation = false
    @observable overlay = {
        show: false,
        message: null
    }
    @observable connection = 'disconnected' // disconnected, trying-reconnection, connected
    @observable currentRoute = null
    @observable axios = null
    @observable socket = null
    @observable sounds = {}

    @action addRequestStatusChangeToServerRequestQueue(serverRequestQueueItem){
        /* remove every */
        let abortRequestNextChanges = false
        this.serverRequestQueue = _.filter(this.serverRequestQueue, (_serverRequestQueueItem, _index) => {
            if(_serverRequestQueueItem.id !== serverRequestQueueItem.id) return true
            // if it is the same request
            if((_serverRequestQueueItem.status === serverRequestQueueItem.status) || abortRequestNextChanges){
                abortRequestNextChanges = true
                return false
            }
            return true
        })

        console.log("Current request queue", JSON.parse(JSON.stringify(this.serverRequestQueue)))
        this.serverRequestQueue.push(serverRequestQueueItem)
    }

    @action showOverlay(message = null){
        this.overlay.show = true
        this.overlay.message = message
    }

    @action hideOverlay(){
        this.overlay.show = false
        this.overlay.message = null
    }

    @action loadSound(){
        this.sounds.message1 = new Sound('message1.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
            }
        })
        this.sounds.sound1 = new Sound('sound1.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
            }
        })
        this.sounds.deny1 = new Sound('deny1.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
            }
        })
        this.sounds.deny2 = new Sound('deny2.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
            }
        })
        this.sounds.horn1 = new Sound('horn1.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error)
            }
        })
    }

    @action loadAxios(){
        const vm = this
        vm.axios = require('axios').create({
            baseURL: config.apiBaseURL
        })
        vm.axios.defaults.timeout = 5000

        // Configure axios to always send token when authenticated
        vm.axios.interceptors.request.use(config => new Promise((resolve, reject) => {
            // Put headers
            if(_.includes(config.url, '/oauth')){
                config.headers['X-Requested-With'] = 'XMLHttpRequest'
                config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
                config.headers['Authorization'] = 'Basic OTg0NzAzNmUwYjY0ZTQ3NGNiZjRhOTdmY2MwYWNiMGQzZDE1NGFmMzpjYWY0Y2E5MDA5NzgyYmM5NmJlNjA0YTk3ZjBjYTAzNmVhOTg2YzE1'
                config.headers['Accept'] = 'application/json'
                return resolve(config)
            }
            else{
                config.headers['Content-Type'] = 'application/json'
                config.headers['Accept'] = 'application/json'
                // Set accessToken when needed
                const tokens = stores.authStore.tokens
                if (tokens) {
                    config.params = {
                        token: tokens.accessToken
                    }
                    return resolve(config)
                }

                return RNLocalStorage.get('auth').then((tokens) => {
                    if(_.get(tokens, 'accessToken', false) && _.get(tokens, 'refreshToken', false)){
                        return {
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken
                        }
                    }
                    return Promise.reject()
                }).then((tokens) => {
                    config.params = {
                        token: tokens.accessToken
                    }
                    return resolve(config)
                }).catch(() => {
                    return resolve(config)
                })
            }
        }))

        vm.axios.interceptors.response.use((response) => { // intercept the global error
            return response.data
        }, function(err){
            if(!err.response){
                return Promise.reject({
                    title: 'Sem resposta',
                    code: 'NO_RESPONSE',
                    message: 'Verifique sua conexão com a Internet. Tente novamente mais tarde.'
                })
            }
            else {
                const originalRequest = err.config
                const serverError = err.response.data
                if(err.response.status === 401 && _.get(serverError,'error.code') && serverError.error.code === 'EXPIRED_TOKEN'){
                    //get refresh token
                    console.log("Tentando adquirir o token usando refreshToken")
                    return stores.authStore.refreshToken().then((refreshedAccessToken) => {
                        console.log("AccessToken adquirido usando refreshToken")
                        originalRequest.params.token = refreshedAccessToken
                        return vm.axios.request(originalRequest)
                    }).catch((err) => {
                        ToastAndroid.show('Não foi possível adquirir o refreshToken. Verifique também sua conexão com a Internet.', ToastAndroid.SHORT)
                    })
                }
                return Promise.reject(new Error(serverError.error.message))
            }
        })
    }

    @action loadIO(){
        window.navigator.userAgent = "react-native"
        const io = require('socket.io-client')
        this.socket = io(config.socketServer + '?token=' + stores.authStore.tokens.accessToken)
    }

    @action setCurrentRoute(name){
        this.currentRoute = name
    }
}

export default new InstanceStore();