import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Platform, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';


import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../../components/UI/HeaderButton';
import OrderItem from '../../components/shop/OrderItem';

import * as ordersActions from '../../store/actions/orders';
import Colors from '../../constants/Colors';

const OrdersScreen = (props) => {

    const token = useSelector(state => state.auth.token);
    let [address, setAddress] = React.useState('Address');
    // Fetching Address every time user open cart (Always get the latest one)
    fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyD480eQzY9RTRTmRSTBhSKYqQlmhmEJBKM', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idToken: token})
    }).then(response => response.json())
        .then(response => {
            const data = response['users'][0];
            if (data.photoUrl) {
                setAddress(data.photoUrl);
            } else {
                setAddress("No Address");
            }
        })

    const [isLoading, setIsLoading] = useState(false);

    const orders = useSelector(state => state.orders.orders);
    const dispatch = useDispatch();

    useEffect(() => {
        // can't use async await here
        // either use .then or wrap in helper fn and call it in here.
        setIsLoading(true);
        dispatch(ordersActions.fetchOrders()).then(() => {
            setIsLoading(false);
        });

    }, [dispatch])
    // if data is not received return this
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary}/>
            </View>
        );
    }
    // if none order show this
    if (orders.length === 0) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>No orders found, maybe start ordering some products?</Text>
            </View>
        );
    }

    return (
        // create list of order items
        <FlatList
            data={orders}
            keyExtractor={item => item.id}
            renderItem={itemData =>
                <OrderItem
                    address={address}
                    amount={itemData.item.totalAmount}
                    date={itemData.item.readableDate}
                    items={itemData.item.items}
                />
            }
        />
    )
}

// Define Header Option for this screen this will used in Navigation
export const screenOptions = (navData) => {
    return {
        headerTitle: "Your Orders",
        headerLeft: () =>
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                <Item
                    title="Menu"
                    iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                    onPress={() => {
                        navData.navigation.toggleDrawer();
                    }}
                />
            </HeaderButtons>,
    }
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default OrdersScreen;
