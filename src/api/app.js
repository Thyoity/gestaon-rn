import _ from 'lodash'
import qs from 'qs'
import stores from '../stores'

export default {
    getVersion(){
        return stores.instanceStore.axios.get('/version')
    },
    syncServerRequestQueue(serverRequestQueue){
        return stores.instanceStore.axios.post('/mobile/requests/status', serverRequestQueue)
    }
}
