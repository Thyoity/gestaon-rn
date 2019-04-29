import { observable, action } from 'mobx'
import _ from 'lodash'
import shortid from 'shortid'
import moment from 'moment'
import { persist } from 'mobx-persist'
import stores from '../../stores/index'
import { ToastAndroid } from 'react-native'

import UsersAPI from '../../api/users'

class RequestsStore {
    @persist('list') @observable requests = []
    @observable isLoading = false
    @observable markers = []
    @observable activeRequestId = null
    @observable scrollerHeight = 100

    @observable panel = null
    @observable showChatTab = false

    @observable _timeInterval = null

    @action setActiveRequestId(activeRequestId = null){
        this.activeRequestId = activeRequestId
    }

    @action _setRequestsInterval(){
        const vm = this
        if(vm._timeInterval){
            clearTimeout(vm._timeInterval)
        }
        vm._timeInterval = setInterval(() => {
            vm.requests = _.map(vm.requests, (request) => {
                request.reduces = _.assign(request.reduces, {
                    markerPinColor: RequestsStore._getColor(request.deliveryDate,!!request.isScheduled)
                })
                return request
            })
        }, 5000)
    }

    @action loadRequests(){
        const vm = this
        return UsersAPI.getRequests().then(({data}) => {
            data.map((request) => {
                const requestClientAddress = _.first(request.requestClientAddresses)
                const clientAddress = requestClientAddress.clientAddress
                const complement = (_.get(clientAddress, 'complement', false)) ? ' ' + clientAddress.complement : ''
                const number = (clientAddress.number) ? clientAddress.number : 'SN'
                const requestOrderSubtotal = _.sumBy(request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                    return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
                })
                request.reduces = {
                    requestOrderSubtotal,
                    createdDatetime: moment(request.dateCreated).format("DD/MM HH:mm"),
                    deadlineDatetime: moment(request.deliveryDate).format("DD/MM HH:mm"),
                    shortAddress: clientAddress.address.name + ", " + number + complement,
                    numberHiddenAddress: clientAddress.address.name + complement + ' - ' + clientAddress.address.neighborhood + ' - ' + clientAddress.address.city + '/' + clientAddress.address.state,
                    address: clientAddress.address.name + ", " + number + complement + ' - ' + clientAddress.address.neighborhood + ' - ' + clientAddress.address.city + '/' + clientAddress.address.state,
                    geocodingAddress: clientAddress.address.name + number + ' ' + clientAddress.address.city + ' ' + clientAddress.address.state,
                    markerPinColor: RequestsStore._getColor(request.deliveryDate,!!request.isScheduled)
                }
                return request
            })
            stores.instanceStore.overlay.show = false
            // update colors
            console.log("Requests atualizado com dados do servidor.")

            const _requests = JSON.parse(JSON.stringify(data))

            // return if the request doesn't belong to current user
            if(vm.activeRequestId && !_.find(_requests, { id: vm.activeRequestId })){
                vm.activeRequestId = null
            }

            vm.requests.replace(_requests)
            stores.instanceStore.overlay.show = false
            vm._setRequestsInterval()
            return vm.requests
        }).catch(() => {
            console.log("Problema ao adquirir pedidos")
            stores.instanceStore.overlay.show = false
        })
    }

    @action loadRequest(id){
        const vm = this
        console.log("Trying to get request", id)
        console.log("Using tokens", stores.authStore.tokens)

        return UsersAPI.getRequest(id).then(({data}) => {
            console.log("Got request", data)
            const request = data
            const requestClientAddress = _.first(request.requestClientAddresses)
            const clientAddress = requestClientAddress.clientAddress
            const complement = (_.get(clientAddress, 'complement', false)) ? ' ' + clientAddress.complement : ''
            const number = (clientAddress.number) ? clientAddress.number : 'SN'
            const requestOrderSubtotal = _.sumBy(request.requestOrder.requestOrderProducts, (requestOrderProduct) => {
                return (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount) * requestOrderProduct.quantity
            })
            request.reduces = {
                requestOrderSubtotal,
                createdDatetime: moment(request.dateCreated).format("DD/MM HH:mm"),
                deadlineDatetime: moment(request.deliveryDate).format("DD/MM HH:mm"),
                shortAddress: clientAddress.address.name + ", " + number + complement,
                numberHiddenAddress: clientAddress.address.name + complement + ' - ' + clientAddress.address.neighborhood + ' - ' + clientAddress.address.city + '/' + clientAddress.address.state,
                address: clientAddress.address.name + ", " + number + complement + ' - ' + clientAddress.address.neighborhood + ' - ' + clientAddress.address.city + '/' + clientAddress.address.state,
                geocodingAddress: clientAddress.address.name + number + ' ' + clientAddress.address.city + ' ' + clientAddress.address.state,
                markerPinColor: RequestsStore._getColor(request.deliveryDate,!!request.isScheduled)
            }
            const existingRequestIndex = _.findIndex(vm.requests, {id: request.id})
            if(existingRequestIndex !== -1){
                vm.requests[existingRequestIndex] = JSON.parse(JSON.stringify(request))
                return {
                    requestId: request.id,
                    operation: 'updated'
                }
            }
            else {
                vm.requests.push(JSON.parse(JSON.stringify(request)))
                return {
                    requestId: request.id,
                    operation: 'added'
                }
            }
        }).catch((err) => {
            console.log("Error getting request", err)
            return Promise.reject(err)
        })
    }

    @action removeRequest(id){
        const requestIndex =  _.findIndex(this.requests, {id: parseInt(id)})
        if(requestIndex !== -1){
            if(parseInt(this.activeRequestId) === parseInt(id)) this.activeRequestId = null
            this.requests.splice(requestIndex,1)
        }
    }

    @action markRequestAsInDisplacement(id){
        if(stores.instanceStore.connection !== 'connected'){
            // ToastAndroid.show('Você não possui conexão com a Internet neste momento. Esta ação será sincronizada assim que sua conexão voltar!', ToastAndroid.SHORT)
        }
        const requestIndex = _.findIndex(this.requests, {id: id})
        if(requestIndex !== -1){
            _.assign(this.requests[requestIndex], {
                status: 'in-displacement'
            })
            const serverRequestItem = {
                tempId: shortid.generate(),
                id: id,
                status: 'in-displacement',
                actionDate: moment()
            }
            stores.instanceStore.addRequestStatusChangeToServerRequestQueue(serverRequestItem)
        }
    }

    @action markRequestAsPending(id){
        if(stores.instanceStore.connection !== 'connected'){
            // ToastAndroid.show('Você não possui conexão com a Internet neste momento. Esta ação será sincronizada assim que sua conexão voltar!', ToastAndroid.SHORT)
        }
        const requestIndex = _.findIndex(this.requests, {id: id})
        if(requestIndex !== -1){
            _.assign(this.requests[requestIndex], {
                status: 'pending'
            })
            const serverRequestItem = {
                tempId: shortid.generate(),
                id: id,
                status: 'pending',
                actionDate: moment()
            }
            stores.instanceStore.addRequestStatusChangeToServerRequestQueue(serverRequestItem)
        }
        return true
    }

    @action markRequestAsFinished(id){
        const serverRequestItem = {
            tempId: shortid.generate(),
            id: id,
            status: 'finished',
            actionDate: moment()
        }
        this.removeRequest(id)
        stores.instanceStore.addRequestStatusChangeToServerRequestQueue(serverRequestItem)
    }

    @action setRequestUnreadChatItemCount(requestId,unreadChatItemCount){
        const vm = this
        const requestIndex = _.findIndex(vm.requests, { id: requestId })
        if(requestIndex !== -1){
            _.assign(vm.requests[requestIndex],{ unreadChatItemCount })
        }
    }

    static _getColor(deadline,isScheduled = false){
        let secondDiff = moment(deadline).diff(moment(), 'minutes')
        let color
        if(isScheduled){
            color = '#C900FD'
        }
        else if(secondDiff > 25){
            color =  '#00D4FF'
        }
        else if(secondDiff > 10){
            color =  '#7FFF7F'
        }
        else if(secondDiff > 5){
            color = '#FFFF55'
        }
        else if(secondDiff > 0){
            color = '#FF7F2A'
        }
        else{
            color = '#FF0000'
        }
        return color
    }

}

export default new RequestsStore();
