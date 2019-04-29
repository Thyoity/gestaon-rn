import _ from 'lodash'
import qs from 'qs'

import stores from '../stores'

export default {
    getMe(){
        return stores.instanceStore.axios.get('/me')
    },
    getRequests(){
        return stores.instanceStore.axios.get('/me/requests')
    },
    getRequest(id){
        return stores.instanceStore.axios.get('/me/requests/' + id)
    },
    setMySetting(setting){
        return stores.instanceStore.axios.post('/me/setting', setting)
    },
    markRequestAsInDisplacement(id){
        return stores.instanceStore.axios.post('/mobile/requests/' + id + '/status', {
            status: 'in-displacement'
        })
    },
    markRequestAsPending(id){
        return stores.instanceStore.axios.post('/mobile/requests/' + id + '/status', {
            status: 'pending'
        })
    },
    markRequestAsFinished(id){
        return stores.instanceStore.axios.post('/mobile/requests/' + id + '/status', {
            status: 'finished'
        })
    },
    changeRequest(){
    },
    createRequest(){
    },
    setFCMToken(fcmToken){
        return stores.instanceStore.axios.post('/users/fcm', {
            fcmToken
        })
    }
}
