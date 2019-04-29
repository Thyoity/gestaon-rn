import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { StyleSheet, View, } from 'react-native'
import {  } from 'react-native-elements'

import _ from 'lodash'

@inject('requestsStore','instanceStore')
@observer
export default class OverlayComponent extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return this.props.instanceStore.overlay.show && (
            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, backgroundColor: 'rgba(190,0,0,.5)'}}>
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
    }
}