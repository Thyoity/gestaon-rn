import React, { Component } from 'react'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import { View, Text, Dimensions, TouchableNativeFeedback, Animated, Platform } from 'react-native'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import _ from 'lodash'

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

@inject('requestsStore','instanceStore')
@observer
export default class Request extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        return (<TouchableNativeFeedback
            onPress={() => {
                this.props.requestsStore.activeRequestId = this.props.request.id
            }}
            background={Platform.Version >= 21 ? TouchableNativeFeedback.Ripple("rgba(0,0,0,.5)",false) : TouchableNativeFeedback.SelectableBackground()}>

            <View style={[styles.container,{backgroundColor: (this.props.index % 2 === 0) ? 'transparent': 'rgba(0,0,0,.1)'}]}>
                <View style={{width: 6, backgroundColor: this.props.request.reduces.markerPinColor, opacity: .7}} />
                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10}}>
                    <View style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ height: 2, backgroundColor: '#FFFFFF0C', flexGrow: 1, flexShrink: 0}} />
                        <View style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={styles.requestId}>#{ this.props.request.id }</Text>
                            <Text style={{ color: '#FFFFFF7F' }}>{this.props.request.reduces.deadlineDatetime}</Text>
                            {(this.props.request.isScheduled) && <Icon
                                containerStyle={{ marginLeft: 3, position: 'relative', top: 0   }}
                                name={ 'schedule' }
                                color='#FFFFFF7F'
                                size={14}
                            />}
                            {(this.props.request.unreadChatItemCount) ? (
                                <View style={{ marginLeft: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                    this.props.requestsStore.activeRequestId = this.props.request.id
                                    this.props.requestsStore.showChatTab = true
                                }}>
                                    <Icon name="chat" color='#e0422a' size={15} />
                                    <Text style={{ marginLeft: 3, color: '#e0422a' }}>{ this.props.request.unreadChatItemCount }</Text>

                                </View>
                            ):(
                                <View style={{ marginLeft: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                    this.props.requestsStore.activeRequestId = this.props.request.id
                                    this.props.requestsStore.showChatTab = true
                                }}>
                                    <Icon name="chat" color='#FFFFFF3F' size={15} />
                                </View>
                            )}
                        </View>
                        <View style={{ height: 2, backgroundColor: '#FFFFFF0C', flexGrow: 1}} />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            { (this.props.request.status === 'in-displacement') && <Icon name="local-shipping" containerStyle={{ top: -1, marginRight: 5 }} color='#FFFFFF7F' size={20} />}
                            { (this.props.request.status === 'in-displacement') && <Text style={{color: '#444', marginTop: -3}}>--> </Text> }
                            <Text style={[styles.clientName,{ color: (this.props.request.status === 'in-displacement') ? '#FFF' : '#FFFFFF7F' }]}>{ this.props.request.client.name }</Text>
                        </View>
                        {(this.props.request.status === 'in-displacement') ? (
                            <Text style={styles.address}>{ this.props.request.reduces.address }</Text>
                            ) : (
                            <Text style={styles.address}>{ this.props.request.reduces.numberHiddenAddress }</Text>
                        )}
                    </View>
                </View>
            </View>
            </TouchableNativeFeedback>
        )
    }
}
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: 124
    },
    requestId: {
        fontSize: 18,
        color: "#FFFFFF3F",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginRight: 10
    },
    clientName: {
        marginTop: 0,
        marginBottom: 3,
        color: "#FFFFFF7F"
    },
    address: {
        color: "#FFFFFF",
        textAlign: 'justify'
    }
}