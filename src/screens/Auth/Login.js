import React, { Component } from 'react'
import { Image, View, Alert } from 'react-native'
import { Button, Input, Icon } from 'react-native-elements'
import { getStatusBarHeight } from 'react-native-status-bar-height'
import Spinner from 'react-native-loading-spinner-overlay'

import { inject, observer } from 'mobx-react'

@inject('authStore','instanceStore','requestsStore')
@observer
export default class Login extends Component {
    static navigationOptions = {
        title: 'Please sign in',
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            email: 'usuario@gestaon.com.br',
            password: '123'
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.props.instanceStore.overlay.show} overlayColor="#2C7176E5" textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <Image style={{ height: 150, marginBottom: 80 }} resizeMode="contain" source={require('../../assets/img/logo.png')} />

                <Input
                    value={this.state.email}
                    onChangeText={(email) => this.setState({email})}
                    placeholder='E-MAIL'
                    containerStyle={{ marginBottom: 20 }}
                    inputStyle={ { height: 52 }}
                    leftIcon={
                        <Icon
                            name='perm-identity'
                            size={24}
                            color='black'
                        />
                    }
                />
                <Input
                    value={this.state.password}
                    onChangeText={(password) => this.setState({password})}
                    secureTextEntry={true}
                    placeholder='SENHA'
                    containerStyle={{ marginBottom: 40 }}
                    inputStyle={ { height: 52 }}
                    leftIcon={
                        <Icon
                            name='lock'
                            size={24}
                            iconStyle={{ position: 'relative' }}
                            color='black'
                        />
                    }
                />
                <Button
                    fontFamily='Lato'
                    buttonStyle={{ width: 200, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                    onPress={this._signInAsync}
                    title='ENTRAR' />
            </View>
        )
    }

    _signInAsync = () => {
        const vm = this
        vm.props.instanceStore.overlay.show = true
        vm.props.instanceStore.overlay.message = "Tentando autenticar..."
        vm.props.authStore.login(vm.state.email,vm.state.password).then(() => {
            vm.props.navigation.navigate('Main')
        }).catch((err) => {
            Alert.alert(
                err.title,
                err.message,
                [
                    {
                        text: 'OK',
                        onPress: () => console.log('OK Pressed')
                    },
                ],
                { cancelable: true }
            )
        }).finally(() => {
            vm.props.instanceStore.overlay.show = false
        })
    }
}

const styles = {
    container: {
        flex: 1,
        flexShrink: 0,
        marginTop: getStatusBarHeight(),
        marginRight: 15,
        marginLeft: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}