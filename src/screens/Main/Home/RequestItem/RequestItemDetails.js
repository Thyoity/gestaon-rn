import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { StyleSheet, ScrollView, View, Dimensions, Image, Text, Animated, ActivityIndicator, TouchableOpacity, ToastAndroid } from 'react-native'
import Communications from 'react-native-communications'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import _ from 'lodash'
import utils from '../../../../utils/index'

import RequestListItem from '../RequestListItem'

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

@inject('requestsStore','instanceStore')
@observer
export default class RequestItemDetails extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const showRequestActionButtons = (request) => {
            if(request.status === 'pending'){
                return (
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                        <Button title='Iniciar deslocamento' onPress={() => {
                            this.props.requestsStore.markRequestAsInDisplacement(request.id)
                        }} containerStyle={{ width: '100%' }} />
                    </View>
                )
            }
            else if(request.status === 'in-displacement') {
                return (
                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                        <Button title='Cancelar deslocamento' onPress={() => {
                            this.props.requestsStore.markRequestAsPending(request.id)
                        }} containerStyle={{ width: '100%', marginBottom: 10 }} buttonStyle={{ backgroundColor: '#e0422a' }} titleStyle={{ fontSize: 10 }} />
                        <Button title='Finalizar pedido' onPress={() => {
                            this.props.requestsStore.markRequestAsFinished(request.id)
                        }} containerStyle={{ width: '100%' }} titleStyle={{ fontSize: 18 }} />
                        <Button title='Ligar p/ cliente' onPress={() => {
                            const clientPhone = _.get(request,'requestClientPhones[0].clientPhone',false)
                            console.log("Request", request)

                            if(clientPhone){
                                Communications.phonecall(clientPhone.number, true)
                            }
                            else {
                                ToastAndroid.show('Sem telefone do cliente', ToastAndroid.SHORT)
                            }
                        }} buttonStyle={{backgroundColor: "#197379"}} containerStyle={{ width: '100%', marginTop: 10 }} titleStyle={{ fontSize: 10 }} />
                    </View>
                )
            }
        }
        const request = _.find(this.props.requestsStore.requests, { id: this.props.requestsStore.activeRequestId })
        return (
            <ScrollView style={styles.requestItemContainer} contentContainerStyle={{ paddingBottom: 0, paddingHorizontal: 20, position: 'relative' }}>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                    <Text style={{ fontSize: 25, color: '#FFF' }}>#{request.id}</Text>
                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,.3)', marginLeft: 8 }}>{request.reduces.createdDatetime}</Text>
                    <View style={{ height: 2, backgroundColor: '#FFFFFF0C', flexGrow: 1, marginLeft: 20}} />
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{ color: '#FFF', marginBottom: 10, marginRight: 8, flexGrow: 1 }}>{request.client.name}</Text>
                    <Text style={{ color: '#FFF', marginBottom: 10, fontSize: 10 }}>{(request.isScheduled)?'Agendado para':'Entregar até'} {request.reduces.deadlineDatetime}</Text>
                </View>
                {(request.status === 'in-displacement') ? (
                    <Text style={{ color: '#FFF', fontSize: 20 }}>{request.reduces.address}</Text>
                ) : (
                    <Text style={{ color: '#FFF', fontSize: 20 }}>{request.reduces.numberHiddenAddress}</Text>
                )}
                { request.obs && request.obs.length &&
                <Text style={{marginTop: 10, color: '#FFF'}}>Obs: {request.obs}</Text>
                }
                {showRequestActionButtons(request)}
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                    <Text style={{ fontSize: 25, color: '#FFF' }}>Produtos</Text>
                    <View style={{ height: 2, backgroundColor: '#FFFFFF0C', flexGrow: 1, marginLeft: 20}} />
                </View>
                <View style={{ }}>
                    {
                        request.requestOrder.requestOrderProducts.map((requestOrderProduct, index) => {
                            const requestOrderProductSubtotal = requestOrderProduct.quantity * (requestOrderProduct.unitPrice - requestOrderProduct.unitDiscount)
                            return (
                                <View key={index} style={{display: 'flex', marginBottom: 10, flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1}}>
                                        <Text style={{ marginRight: 5, flexGrow: 1, color: '#FFF' }}>{ requestOrderProduct.quantity } { requestOrderProduct.product.name }</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Text style={{ marginRight: 10, color: '#FFF' }}>{ utils.formatMoney(requestOrderProduct.unitPrice, 2, 'R$ ', '.', ',') }</Text>
                                            <Text style={{ color: '#FFF' }}>- { utils.formatMoney(requestOrderProduct.unitDiscount, 2, 'R$ ', '.', ',') }</Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 18, color: '#FFF' }}>{ utils.formatMoney(requestOrderProductSubtotal, 2, 'R$ ', '.', ',') }</Text>
                                </View>
                            )
                        })
                    }
                </View>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                    <Text style={{ fontSize: 25, color: '#FFF' }}>Pagamento</Text>
                    <View style={{ height: 2, backgroundColor: '#FFFFFF0C', flexGrow: 1, marginLeft: 20}} />
                </View>
                <View style={{ marginBottom: 20 }}>
                    {
                        request.requestPayments.map((requestPayment, index) => {
                            return (
                                <View key={index} style={{display: 'flex', marginBottom: 10, flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1}}>
                                        <Text style={{ marginRight: 5, flexGrow: 1, color: '#FFF' }}>{ requestPayment.paymentMethod.name }</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon
                                                containerStyle={{ marginRight: 5 }}
                                                name={ (requestPayment.received) ? 'thumb-up' : 'thumb-down' }
                                                color='#fff'
                                                size={14}
                                            />
                                            <Text style={{ color: '#FFF' }}>{ (requestPayment.received) ? 'Pago' : 'Não pago' } </Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 18, color: '#FFF' }}>{ utils.formatMoney(requestPayment.amount, 2, 'R$ ', '.', ',') }</Text>
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
        )

    }
}

const styles = {
    requestItemContainer: {
        flex: 1
    }
}