import { observable, action, computed } from 'mobx'
import _ from 'lodash'
import RNLocalStorage from 'react-native-local-storage'
import { persist } from 'mobx-persist'

import OAuthAPI from '../../api/oauth'
import UsersAPI from '../../api/users'

import { createUser } from '../../models/User'

import firebase from 'react-native-firebase'

class AuthStore {
    @persist('object') @observable user = null
    @observable tokens = null

    @computed get hasStoredTokens() {
        return this.price * this.amount;
    }

    @action setTokens(accessToken, refreshToken){
        this.tokens = {
            accessToken,
            refreshToken
        }
    }

    @action login(email, password){
        const vm = this
        return firebase.messaging().getToken().then(fcmToken => {
            if (fcmToken) {
                return OAuthAPI.token({
                    email,
                    password
                }).then(({data}) => {
                    vm.setTokens(data.accessToken,data.refreshToken)
                    return RNLocalStorage.save('auth', vm.tokens).then(() => {
                        return UsersAPI.setFCMToken(fcmToken).then(() => {
                            return vm.getUser().then((user) => {
                                return user
                            })
                        })
                    })
                })
            } else {
                return Promise.reject(new Error("Couldn't get FCM Token. Check your Internet connection."))
            }
        })
    }

    @action getUser(){
        const vm = this
        return UsersAPI.getMe().then((result) => {
            const user = createUser(result.data)
            vm.user = user
            return user
        }).catch((err) => {
            console.log("Err user", err)
        })
    }

    @action setMySetting(name,value){
        const vm = this

        return UsersAPI.setMySetting({
            name,
            value
        }).then((result) => {
            const index = _.findIndex(vm.user.userSettings, {
                name: name
            })
            if(index !== -1){
                vm.user.userSettings[index].value = value
            }
            else {
                vm.user.userSettings.push({
                    name, value
                })
            }
            console.log("Oq virou",vm.user.userSettings)
            return true
        }).catch((err) => {
            console.log("Err set my setting", err)
        })

    }

    @action refreshToken(){
        const vm = this
        return new Promise((resolve, reject) => {
            if(_.get(vm.tokens,'refreshToken',false)){
                OAuthAPI.refreshToken(vm.tokens.refreshToken).then(({data}) => {
                    vm.setTokens(data.accessToken,data.refreshToken)
                    return RNLocalStorage.save('auth', vm.tokens).then(() => {
                        return data.accessToken
                    })
                }).then((refreshedAccessToken) => {
                    resolve(refreshedAccessToken)
                }).catch((err) => {
                    reject(err)
                })
            }
            else {
                return reject(new Error("Refresh Token not found."))
            }
        })

    }

    @action logout(){
        const vm = this
        return new Promise((resolve, reject) => {
            RNLocalStorage.remove('auth').then(() => {
                vm.user = null
                resolve()
            })
        })
    }
}

export default new AuthStore();