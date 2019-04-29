import _ from 'lodash'

export class UserModel {
    constructor({
        id = null,
        name = '',
        email = '',
        password = '',
        type = 'worker',
        userSettings = []
    } = {}){
        this.id = id
        this.name = name
        this.email = email
        this.password = password
        this.type = type
        this.userSettings = []
    }
}

export function createUser(data){
    return new UserModel(data)
}