import React, { Component } from 'react'
import { View, Button, Text, Image } from 'react-native'
import { Header, Card, ListItem, Icon } from 'react-native-elements'
/* import OverlayComponent from '../../components/OverlayComponent' */
import VersionCheck from 'react-native-version-check'

import headerStyles from '../../assets/styles/header.styles'

export default class About extends Component {
    static navigationOptions = {
        header: null,
        title: 'Sobre'
    }
    componentDidMount(){
        /*VersionCheck.getLatestVersion({
            provider: 'playStore'
        })
        .then(latestVersion => {
            console.log("Latest version: " + latestVersion);    // 0.1.2
        })*/
    }
    render() {
        return (
            <View style={styles.container}>
                <Header
                    outerContainerStyles={ headerStyles.outerContainerStyles }
                    leftComponent={<Icon
                        name="menu"
                        color='#fff'
                        onPress={() => this.props.navigation.openDrawer()}
                        underlayColor={'#64b5f6'}
                    />}
                    centerComponent={{ text: "Sobre", style: { color: '#FFF' } }}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Aplicativo criado com carinho</Text>
                    <Image style={{ height: 50, marginTop: 30 }} resizeMode="contain" source={require('../../assets/img/logo-extended.png')} />
                </View>
            </View>
        )
    }

    _back = () => {
        this.props.navigation.navigate('Home')
    }

}

const styles = {
    container: {
        flex: 1
    }
}