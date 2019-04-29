import _ from 'lodash'
import qs from 'qs'
import stores from '../stores'

export default {
    token(credentials){
        return stores.instanceStore.axios.post('/oauth/token', qs.stringify({
            'grant_type': 'password',
            'scope': 'all',
            'username': credentials.email,
            'password': credentials.password
        }))
    },
    refreshToken(refreshToken){
        return stores.instanceStore.axios.post('/oauth/token', qs.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        }))
    }
}
