import React, { Component } from 'react'
import { intercept, observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import { StyleSheet, ScrollView, View, Dimensions, Image, Text, Animated, ActivityIndicator, TouchableOpacity, ToastAndroid, FlatList, Keyboard } from 'react-native'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import _ from 'lodash'
import moment from 'moment'
import shortid from 'shortid'
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import KeyboardSpacer from 'react-native-keyboard-spacer'

import RequestItemChatItem from './RequestItemChatItem'

import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'

@inject('authStore','requestsStore','instanceStore')
@observer
export default class RequestItemChat extends Component {
    constructor(props) {
        super(props)
        this._scrollView = null
        this.state = {
            requestId: null,
            inputText: '',
            inputHeight: 0,
            items: []
        }
    }
    _updateScroll(timeout = 100){
        const vm = this
        setTimeout(() => {
            if(!!vm._scrollView){
                vm._scrollView.scrollToEnd()
            }
        }, timeout)
    }
    _chatLoad = (ev) => {
        const vm = this
        console.log("Received request-chat:load", ev)
        if(ev.success){
            vm.setState({
                items: _.reverse(ev.evData)
            })
        }
    }
    _itemSend = (ev) => {
        const vm = this
        console.log("Received request-chat:itemSend", ev)
        if(ev.success && !_.find(vm.state.items, { tempId: ev.evData.tempId })){
            const items = vm.state.items
            items.push(ev.evData)
            vm.setState({
                items
            })
        }
    }
    _keyboardDidShow = () => {
        this.props.requestsStore.panel.snapTo({index: 0})
    }
    componentWillMount(){
        const vm = this
        vm._keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
        vm.setState({
            requestId: vm.props.requestsStore.activeRequestId
        })
    }
    componentDidMount(){
        const vm = this
        vm.props.instanceStore.socket.emit('request-chat:load', {
            requestId: vm.props.requestsStore.activeRequestId
        })
        vm.props.instanceStore.socket.on('request-chat:load', this._chatLoad)
        vm.props.instanceStore.socket.on('request-chat:itemSend', this._itemSend)
    }
    componentWillUnmount(){
        const vm = this
        vm._keyboardDidShowListener.remove()
        const emitData = {
            requestId: this.state.requestId
        }
        console.log("Emitting request-chat:leave", emitData)
        this.props.instanceStore.socket.emit('request-chat:leave', emitData)
        vm.props.instanceStore.socket.removeListener('request-chat:load', this._chatLoad)
        vm.props.instanceStore.socket.removeListener('request-chat:itemSend', this._itemSend)
    }

    _keyExtractor = (item, index) => index.toString()

    render() {
        const vm = this
        const request = _.find(vm.props.requestsStore.requests, { id: vm.props.requestsStore.activeRequestId })
        return (
            <View style={styles.requestItemContainer} >
                { vm.state.items.length ? (

                    <KeyboardAwareFlatList
                        enableOnAndroid={true}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            vm._scrollView.scrollToEnd()
                        }}
                        ref={(scrollViewComponent) => this._scrollView = scrollViewComponent}
                        data={this.state.items}
                        keyExtractor={this._keyExtractor}
                        /*ItemSeparatorComponent={() => <View style={{ height: 5 }} />}*/
                        renderItem={({item}) => <RequestItemChatItem item={item} user={this.props.authStore.user} />} />
                ) : (
                    <View style={{display: 'flex', flexDirection: 'column', flexGrow: 1, padding: 20}}>
                        <Text style={styles.panelSubtitle}>Mande a primeira mensagem neste pedido usando o campo no final do seu dispositivo...</Text>
                    </View>
                ) }
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }} onLayout={(event) => {
                    this.setState({
                        inputHeight: event.nativeEvent.layout.height
                    })
                }}>
                    <View style={{ flex: 1, flexGrow: 1 }}>

                        <AutoGrowingTextInput value={this.state.inputText} maxHeight={120} style={{ backgroundColor: 'rgba(255,255,255,.3)', paddingHorizontal: 10 }}
                              underlineColorAndroid={'rgba(255,255,255,0)'}
                            onChangeText={(value) => {
                                this.setState({
                                    inputText: value
                                })
                            }} placeholder={'digite sua mensagem...'} />
                    </View>
                    <Icon
                        containerStyle={{ alignSelf: 'flex-end', marginBottom: 2, flexShrink: 0}}
                        raised
                        name={ 'thumb-up' }
                        onPress={() => {
                            if(vm.state.inputText.length){
                                const tempId = shortid.generate()
                                const items = vm.state.items
                                items.push({
                                    tempId,
                                    user: vm.props.authStore.user,
                                    data: vm.state.inputText,
                                    dateCreated: moment(),
                                    type: 'message'
                                })
                                vm.setState({
                                    items
                                })
                                const emitData = {
                                    tempId,
                                    requestId: request.id,
                                    type: 'message',
                                    data: vm.state.inputText
                                }
                                console.log("Sending to request-chat:itemSend: ", emitData)
                                vm.props.instanceStore.socket.emit('request-chat:itemSend', emitData)
                                this.setState({
                                    inputText: ''
                                })
                            }
                        }}
                        color='#222'
                        size={14}
                    />
                </View>
                <KeyboardSpacer />
            </View>
        )

    }
}


const styles = {
    requestItemContainer: {
        flex: 1,
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray'
    }
}