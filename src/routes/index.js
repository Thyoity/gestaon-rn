import { createDrawerNavigator, createSwitchNavigator, createStackNavigator } from 'react-navigation'
import { View, ToastAndroid, Text, Linking } from 'react-native'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'

import AuthDecider from '../screens/AuthDecider'

import NavigationDrawer from '../screens/Main/NavigationDrawer'

import Login from '../screens/Auth/Login'
import Home from '../screens/Main/Home/index'
import About from '../screens/Main/About'

import React, { Component } from 'react'



import stores from '../stores/index'

const NavigationDrawerNavigator = createDrawerNavigator({
    Home: {
        screen: Home
    },
    About: {
        screen: About
    }
}, {
    contentComponent: NavigationDrawer,
    drawerLockMode: 'unlocked'
})

const SwitchNavigator = createSwitchNavigator(
    {
        AuthDecider: AuthDecider,
        Main: createStackNavigator(
            {
                Initial: {
                    screen: NavigationDrawerNavigator
                }
            },
            {
                initialRouteName: 'Initial',
                navigationOptions: {
                    header: null
                }
            }
        ),
        Auth: createStackNavigator({
            Login: Login
        }),
    },
    {
        initialRouteName: 'AuthDecider',
    }
)

@inject('authStore','instanceStore')
@observer
export default class Routes extends Component {
    constructor(props){
        super(props)
        props.instanceStore.loadAxios()
    }

    _getActiveRouteName(navigationState) {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this._getActiveRouteName(route);
        }
        return route.routeName;
    }

    render(){
        return (<View style={{ flex: 1}}>
            <SwitchNavigator onNavigationStateChange={(prevState, currentState) => {
                const currentScreen = this._getActiveRouteName(currentState)
                const prevScreen = this._getActiveRouteName(prevState)

                this.props.instanceStore.setCurrentRoute(currentScreen)
            }} />
        </View>)
    }
}