import _ from 'lodash'

export class RequestModel {
    constructor({
            id = null,
            client: {},
            requestClientAddresses = [],
        } = {}){
        this.id = id
        this.client = _.assign(this.client, client)
        this.requestClientAddresses = []
    }

    getFullClientAddress(){
        const clientAddress = _.first(this.requestClientAddresses).clientAddress
        let complement = ''
        if(_.get(clientAddress, 'complement', false)){
            complement = ' - ' + clientAddress.complement
        }
        return clientAddress.address.name + ", " + clientAddress.number + complement + ' - ' + clientAddress.address.neighborhood + ' - ' + clientAddress.address.city + '/' + clientAddress.address.state
    }
}

export function createRequest(data){
    return new RequestModel(data)
}