import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { StyleSheet, ScrollView, View, Dimensions, Image, Text, Animated, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Header, Card, ListItem, Icon, Button } from 'react-native-elements'
import _ from 'lodash'

import RequestListItem from './RequestListItem'

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

    componentDidMount(){

    }

    render() {
        const showRequestList = () => {
            return (
                <ScrollView style={styles.requestListContainer} contentContainerStyle={{ paddingBottom: 0 }}>
                    {
                        this.props.requestsStore.requests.map((request, index) => {
                            return (
                                <RequestListItem key={index} request={request} index={index} />
                            )
                        })
                    }
                </ScrollView>
            )
        }
        return (
            <View>
                <View style={styles.panelHeader}>
                    <View style={[styles.panelHandle, {position:'relative'}]} />

                    <View style={{ position:'absolute', right: 14 }}>

                        <Icon
                            name='refresh'
                            color='rgba(255,255,255,.3)'
                            underlayColor={'transparent'}
                            size={22}
                            onPress={() => {
                                this.props.requestsStore.loadRequests()
                            }}/>
                    </View>
                </View>
                <View style={[styles.panelContent, { height: this.props.requestsStore.scrollerHeight }]}>
                    {
                        !this.props.requestsStore.requests.length ? (
                            <View style={{display: 'flex', flexDirection: 'column', flexGrow: 1, padding: 20}}>
                                <Text style={styles.panelTitle}>Ops...</Text>
                                <Text style={styles.panelSubtitle}>Não encontramos nenhum pedido para você...</Text>
                            </View>
                        ) : showRequestList()
                    }
                </View>
            </View>
        )

    }
}

const styles = {
    panelHeader: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 40,
        backgroundColor: 'rgba(0,0,0,.2)'
    },
    panelHandle: {
        width: 70,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF40',
    },
    panelContent: {
    },
    panelTitle: {
        fontSize: 27,
        color: '#FFF'
    },
    panelSubtitle: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 10

    },
    panelButton: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#318bfb',
        alignItems: 'center',
        marginVertical: 10
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white'
    },
    photo: {
        width: Screen.width-40,
        height: 225,
        marginTop: 30
    },

    requestListContainer: {
        flex: 1
    }
}