import React, { Component } from 'react'
import { autorun, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { StyleSheet, View, Dimensions, Image, Text, Animated, TouchableOpacity, BackHandler, StatusBar, ToastAndroid, Platform, Linking } from 'react-native'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import firebase, {RemoteMessage, Notification} from 'react-native-firebase'
/*import OverlayComponent from '../../../components/OverlayComponent'*/
import Interactable from 'react-native-interactable'
import RequestList from './RequestList'
import RequestItem from './RequestItem/index'
import io from 'socket.io-client'

import AppAPI from '../../../api/app'
import _ from 'lodash'

import MapView, {Marker} from 'react-native-maps'

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

@inject('requestsStore','instanceStore')
@observer
export default class Home extends Component {

    _didFocusSubscription
    _willBlurSubscription

    static navigationOptions = {
        header: null,
        title: 'Pedidos'
    }

    constructor(props) {
        super(props)
        this._map = null
        this._markers = {}
        this._dragTimeout = null
        this._currentDeltaY = null

        this._deltaY = new Animated.Value(Screen.height-175)
        this._deltaY.addListener((ev) => {
            if(!this._dragTimeout) {
                this._dragTimeout = setTimeout(() => {
                    clearTimeout(this._dragTimeout)
                    this._dragTimeout = null
                    const topSpace = Math.round(ev.value)
                    this._currentDeltaY = topSpace
                    this.props.requestsStore.scrollerHeight = Screen.height - topSpace - 40
                }, 0)
            }
        })
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this._onBackButtonPressAndroid)
        )
        this.state = {}
    }

    componentWillMount(){
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this._onBackButtonPressAndroid)
        )
    }

    componentWillUnmount(){
        this.props.requestsStore.panel = null
        this._didFocusSubscription && this._didFocusSubscription.remove()
        this._willBlurSubscription && this._willBlurSubscription.remove()
    }

    componentDidMount(){
        reaction(
            () => this.props.requestsStore.activeRequestId,
            activeRequestId => {
                if(activeRequestId && _.get(this._markers, activeRequestId + '.props.coordinate', false) && this._map){
                    const marker = this._markers[activeRequestId]
                    const coordinate =  marker.props.coordinate
                    if(_.get(coordinate,'latitude',false) && _.get(coordinate,'longitude',false)){
                        if(!!this.props.requestsStore.panel && (this._currentDeltaY !== this.props.requestsStore.panel.props.snapPoints[1].y)){
                            this.props.requestsStore.panel.snapTo({index: 1})
                        }
                        this._map.animateToCoordinate({
                            latitude: parseFloat(coordinate.latitude),
                            longitude: parseFloat(coordinate.longitude)
                        })
                    }
                }
            }
        )
    }

    _onBackButtonPressAndroid = () => {
        if(!!this.props.requestsStore.activeRequestId){
            this.props.requestsStore.activeRequestId = null
            return true
        }
        else if(!!this.props.requestsStore.panel && (this._currentDeltaY !== this.props.requestsStore.panel.props.snapPoints[2].y)){
            this.props.requestsStore.panel.snapTo({index: 2})
            return true
        }
        return false
    }

    _syncButton = () => {
        if(this.props.instanceStore.serverRequestQueue.length && this.props.instanceStore.connection === 'connected'){
            return (<Icon
                type="material-community"
                size={15}
                color="#50e3c2"
                containerStyle={{ }}
                name='sync' />)
        }
        else if(this.props.instanceStore.serverRequestQueue.length && this.props.instanceStore.connection !== 'connected'){
            return (<Icon
                type="material-community"
                size={18}
                color="#D8B132"
                containerStyle={{ marginLeft: -3 }}
                name='sync-off' />)
        }
    }


    render() {
        /*{ this.props.instanceStore.showConnectionWarning && (
            <View style={{
                position: 'absolute', flex: 1, top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999,
                backgroundColor: 'rgba(0,0,0,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{color: '#FFF', marginBottom: 20}}>Verifique sua conexão com a Internet...</Text>
                <Button title="Tentar reconexão" onPress={() => {
                    this.props.instanceStore.showConnectionWarning = false
                    this.props.requestsStore.loadRequests()
                }} />
            </View>
        ) }*/
        return (
            <View style={styles.container}>
                <View style={styles.overlayButtonsLeft} pointerEvents={'none'}>
                    <Icon
                        type="material-community"
                        size={15}
                        containerStyle={{ padding: 5 }}
                        name={ (this.props.instanceStore.connection === 'disconnected') ? 'lan-disconnect' : ((this.props.instanceStore.connection === 'connected') ? 'lan-connect' : 'lan-pending') }
                        color={ (this.props.instanceStore.connection === 'disconnected') ? '#e0422a' : ((this.props.instanceStore.connection === 'connected') ? '#50e3c2' : '#D8B132') }
                    />
                    { this._syncButton() }
                </View>
                <View style={styles.overlayButtonsRight} pointerEvents={'box-none'}>
                    <Icon
                        raised
                        reverse
                        name='my-location'
                        color='#1E1E22F2'
                        size={16}
                        reverseColor={(this.props.instanceStore.showLocation)?'#318bfb':'rgba(255,255,255,.5)'}
                        onPress={() => {
                            this.props.instanceStore.showLocation = !this.props.instanceStore.showLocation
                        }}/>
                    { !!this.props.requestsStore.activeRequestId && (
                        <Icon
                            raised
                            name='directions'
                            reverse
                            color='#1E1E22F2'
                            reverseColor="#FFF"
                            containerStyle={{marginTop: -6}}
                            size={16}
                            onPress={() => {
                                const request = _.find(this.props.requestsStore.requests, { id: this.props.requestsStore.activeRequestId })
                                if(request && _.get(request,'requestClientAddresses[0].lat') && _.get(request,'requestClientAddresses[0].lng')){
                                    Linking.openURL('http://maps.google.com/maps?daddr=' + _.first(request.requestClientAddresses).lat + ',' + _.first(request.requestClientAddresses).lng)
                                }
                                else {
                                    ToastAndroid.show("Não foi possível adquirir as coordenadas para este pedido.",ToastAndroid.SHORT)
                                }
                            }} />
                    ) }
                    { !!this.props.requestsStore.activeRequestId && (
                        <Icon
                            raised
                            name='format-list-numbered'
                            reverse
                            color='#1E1E22F2'
                            reverseColor="#FFF"
                            containerStyle={{marginTop: -6}}
                            size={16}
                            onPress={() => {
                                this.props.requestsStore.activeRequestId = null
                            }} />
                    ) }
                </View>
                <MapView
                    style={[styles.map]}
                    initialRegion={{
                        latitude: -23.4140934,
                        longitude: -51.903494,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003
                    }}
                    ref={map => this._map = map}
                    showsUserLocation={this.props.instanceStore.showLocation}
                    loadingEnabled={true}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    showsScale={false}
                    zoomControlEnabled={false}
                    toolbarEnabled={false}
                    mapPadding={{top: 0,left:0,right:0,bottom: (Screen.height / 2) - 20}}
                >
                    {
                        _.map(_.filter(this.props.requestsStore.requests, (request, index) => {
                            return _.get(request,'requestClientAddresses[0].lat',false) && _.get(request,'requestClientAddresses[0].lng',false)
                        }), (request, index) => {
                            return (
                                <Marker
                                    key={index}
                                    ref={marker => {
                                        this._markers = _.assign(this._markers, {
                                            [request.id]: marker
                                        })
                                    }}
                                    image={(request.isScheduled) ? require('../../../assets/img/markers/scheduled.png') : null}
                                    pinColor={request.reduces.markerPinColor}
                                    coordinate={{ latitude: parseFloat(_.first(request.requestClientAddresses).lat), longitude: parseFloat(_.first(request.requestClientAddresses).lng)}}
                                    onPress={() => {
                                        this.props.requestsStore.activeRequestId = request.id
                                    }}
                                />

                            )
                        })
                    }
                </MapView>
                <View style={styles.panelContainer} pointerEvents={'box-none'}>
                    <Animated.View
                        pointerEvents={'box-none'}
                        style={[styles.panelContainer, {
                            backgroundColor: 'black',
                            opacity: this._deltaY.interpolate({
                                inputRange: [0, Screen.height-175],
                                outputRange: [0.5, 0],
                                extrapolateRight: 'clamp'
                            })
                        }]} />
                    <Interactable.View
                        verticalOnly={true}
                        ref={component => this.props.requestsStore.panel = component}
                        snapPoints={[{y: 40}, {y: Screen.height-375}, {y: Screen.height-175}]}
                        boundaries={{top: -300}}
                        initialPosition={{y: Screen.height-175}}
                        animatedValueY={this._deltaY}>
                        <View style={styles.panel}>
                            {!this.props.requestsStore.activeRequestId ? (
                                <RequestList />
                            ) : (
                                <RequestItem />
                            )}
                        </View>
                    </Interactable.View>
                </View>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#efefef'
    },
    overlayButtonsLeft: {
        position: 'absolute',
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        top: StatusBar.currentHeight,
        width: Screen.width / 2,
        left: 3,
        zIndex: 10000
    },
    overlayButtonsRight: {
        position: 'absolute',
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        top: StatusBar.currentHeight,
        width: Screen.width / 2,
        right: 0,
        zIndex: 10000
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    panelContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    panel: {
        height: Screen.height + 375,
        paddingBottom: 20,
        marginTop: 0,
        paddingHorizontal: 0,
        backgroundColor: '#1E1E22F2',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 5,
        shadowOpacity: 0.4
    }
}