import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { View, Text } from 'react-native'
import { Icon } from 'react-native-elements'
import _ from 'lodash'
import moment from 'moment'

export default class RequestItemChatItem extends React.PureComponent {
    constructor(props) {
        super(props)
    }
    render() {
        if(this.props.item.user.id !== this.props.user.id){ // if other users
            if(this.props.item.type === 'message')
                return (
                    <View style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', position: 'relative', alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,.5)', minWidth: 100, padding: 10, marginHorizontal: 10, marginBottom: 10}}>
                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{ this.props.item.user.name }</Text>
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', paddingBottom: 15 }}>{ this.props.item.data }</Text>
                        <Text style={{position: 'absolute', fontSize: 10, right: 3, bottom: 3, color: 'rgba(255,255,255,.5)'}}>{ moment(this.props.item.dateCreated).format("HH:mm") }</Text>
                    </View>
                )
            else if(this.props.item.type === 'alert')
                return (
                    <View style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', position: 'relative', alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,.5)', minWidth: 100, padding: 10, marginHorizontal: 10, marginBottom: 10}}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{ this.props.item.user.name }</Text>
                        <Icon
                            containerStyle={{ marginTop: 3, alignSelf: 'flex-start', paddingBottom: 15 }}
                            name={ 'notifications-active' }
                            color='#FFF'
                            size={30}
                            />
                        <Text style={{fontSize: 10, position: 'absolute', right: 3, bottom: 3, color: 'rgba(255,255,255,.5)'}}>{ moment(this.props.item.dateCreated).format("HH:mm") }</Text>
                    </View>
                )

        }
        else { // if it is my message
            if(this.props.item.type === 'message')
                return (
                    <View style={{ alignSelf: 'flex-end', maxWidth: '80%', position: 'relative', backgroundColor: 'rgba(0,0,0,.2)', minWidth: 100, padding: 10, marginHorizontal: 10, marginBottom: 10}}>
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', paddingBottom: 15 }}>{ this.props.item.data }</Text>
                        <Text style={{position: 'absolute', fontSize: 10, right: 3, bottom: 3, color: 'rgba(255,255,255,.5)'}}>{ moment(this.props.item.dateCreated).format("HH:mm") }</Text>
                    </View>
                )
            else if(this.props.item.type === 'alert')
                return (

                    <View style={{ alignSelf: 'flex-end', maxWidth: '80%', position: 'relative', backgroundColor: 'rgba(0,0,0,.2)', minWidth: 100, padding: 10, marginHorizontal: 10, marginBottom: 10}}>
                        <Icon
                            containerStyle={{ marginTop: 3, alignSelf: 'flex-start', paddingBottom: 15 }}
                            name={ 'notifications-active' }
                            color='#FFF'
                            size={30}
                        />
                        <Text style={{position: 'absolute', fontSize: 10, right: 3, bottom: 3, color: 'rgba(255,255,255,.5)'}}>{ moment(this.props.item.dateCreated).format("HH:mm") }</Text>
                    </View>
                )
        }
    }

}