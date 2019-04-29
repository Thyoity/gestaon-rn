import React, { Component } from 'react'
import {reaction} from 'mobx'
import { inject, observer } from 'mobx-react'
import { StyleSheet, ScrollView, View, Dimensions, Image, Text, Animated, ActivityIndicator, TouchableOpacity, ToastAndroid } from 'react-native'
import Interactable from 'react-native-interactable'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import _ from 'lodash'
import utils from '../../../../utils/index'

import RequestItemDetails from './RequestItemDetails'
import RequestItemChat from './RequestItemChat'

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

@inject('requestsStore','instanceStore')
@observer
export default class Request extends Component {

    constructor(props) {
        super(props)
        this.state = {
            requestItemDetails: true,
            requestItemChat: false
        }
        this._interactable = null
        this._deltaX = new Animated.Value(0)
    }

    componentDidMount(){
    }

    _renderRequestItem(){
        return (
            <View style={{ flex: 1 }}>
                <Interactable.View
                    ref={(interactableComponent) => { this._interactable = interactableComponent}}
                    style={{ flex: 1, width: Screen.width * 2, flexDirection: 'row' }}
                    horizontalOnly={true}
                    animatedValueX={this._deltaX}
                    initialPosition={{x: (this.props.requestsStore.showChatTab) ? -Screen.width : 0}}
                    onSnap={(ev) => {
                        if(ev.nativeEvent.index === 0){
                            this.props.requestsStore.showChatTab = false
                        }
                        else if(ev.nativeEvent.index === 1){
                            this.props.requestsStore.showChatTab = true
                        }
                    }}
                    snapPoints={[{x: 0}, {x: -Screen.width}]} >
                    <View style={{ flexGrow: 1, width: Screen.width }}>
                        <RequestItemDetails/>
                    </View>
                    <View style={{ flexGrow: 1, width: Screen.width }}>
                        { (this.props.requestsStore.showChatTab && this.props.instanceStore.connection === 'connected') ? (
                            <RequestItemChat />
                        ) : (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <ActivityIndicator size={50} />
                            </View>
                        ) }
                    </View>
                </Interactable.View>
            </View>
        )
    }

    render() {
        const request = _.find(this.props.requestsStore.requests, { id: this.props.requestsStore.activeRequestId })
        return (
            <View>
                <View style={styles.panelHeader}>
                    <Text style={{ fontSize: 12, color: (!this.props.requestsStore.showChatTab) ? '#4d76c8' : '#444', marginLeft: 20 }} onPress={() => {
                        this.props.requestsStore.showChatTab = false
                        this._interactable.snapTo({index: 0})
                    }}>PEDIDO</Text>
                    <View style={styles.panelHandle} />
                    <View style={{ display: 'flex', flexDirection: 'row', marginRight: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: (this.props.requestsStore.showChatTab) ? '#4d76c8' : '#444' }} onPress={() => {
                            this.props.requestsStore.showChatTab = true
                            this._interactable.snapTo({index: 1})
                        }}>CHAT</Text>
                        { request.unreadChatItemCount > 0 && <Text style={{ color: '#e0422a', marginLeft: 5 }}>{ request.unreadChatItemCount }</Text> }
                    </View>
                </View>
                <View style={[styles.panelContent, { height: this.props.requestsStore.scrollerHeight }]}>
                    { !this.props.instanceStore.overlay.show && this._renderRequestItem() }
                </View>
            </View>
        )
    }
}

const styles = {
    panelHeader: {
        alignItems: 'center',
        justifyContent: 'space-between',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,.2)',
        height: 40
    },
    panelHandle: {
        width: 70,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF40',
    },
    panelContent: {
    },
    requestItemContainer: {
        flex: 1
    }
}