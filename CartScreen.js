import React, {useState} from 'react';
import {ActivityIndicator, Button, FlatList, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors from '../../constants/Colors';
import CartItem from '../../components/shop/CartItem';

import * as cartActions from '../../store/actions/cart';
import * as ordersActions from '../../store/actions/orders';
import Card from '../../components/UI/Card';

const CartScreen = (props) => {
    const token = useSelector(state => state.auth.token);
    const [isLoading, setIsLoading] = useState(false);
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
    // Get cart total amount
    const cartTotalAmount = useSelector(state => state.cart.totalAmount);
    // Get Cart Items
    const cartItems = useSelector(state => {
        const transformedCartItems = [];
        for (const key in state.cart.items) {
            transformedCartItems.push({
                productId: key,
                productTitle: state.cart.items[key].productTitle,
                productPrice: state.cart.items[key].productPrice,
                quantity: state.cart.items[key].quantity,
                sum: state.cart.items[key].sum
            });
        }
        return transformedCartItems.sort((a, b) => a.productId > b.productId ? 1 : -1);
    });

    const dispatch = useDispatch();

    // handle order
    const sendOrderHandler = async () => {
        setIsLoading(true);
        await dispatch(ordersActions.addOrder(cartItems, cartTotalAmount));
        setIsLoading(false);
    }

    return (
        <View style={styles.screen}>
            <Text>Address</Text>
            <Card style={styles.summary}>
                <Text style={styles.summaryText}>{address}</Text>
            </Card>
            <Card style={styles.summary}>
                <Text style={styles.summaryText}>
                    {/* We already added 7 RM to cart so we display -7  */}
                    Total: <Text
                    style={styles.amount}> RM {(Math.round(cartTotalAmount.toFixed(2) * 100) / 100) - 7} </Text>
                    {'\n'}
                    {/* We show shipping price if total*/}
                    Ship : <Text
                    style={styles.amount}> RM {cartTotalAmount > 7 ? 7 : 0}</Text>
                    {'\n'}
                    {/* We already added 7 RM to cart so we display -7  */}
                    Final: <Text
                    style={styles.amount}> RM {cartTotalAmount > 7 ? (Math.round(cartTotalAmount.toFixed(2) * 100) / 100) : 0} </Text>
                </Text>
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary}/>
                ) : (
                    <Button
                        color={Colors.accent}
                        title="Order Now"
                        disabled={cartItems.length === 0}
                        onPress={sendOrderHandler}
                    />
                )}
            </Card>
            <FlatList
                data={cartItems}
                keyExtractor={item => item.productId}
                renderItem={itemData => (
                    // Cart Items List
                    <CartItem
                        quantity={itemData.item.quantity}
                        title={itemData.item.productTitle}
                        amount={itemData.item.sum}
                        deletable={true}
                        onRemove={() => {
                            dispatch(cartActions.removeFromCart(itemData.item.productId));
                        }}
                    />
                )}
            />

        </View>

    );
}

export const screenOptions = (navData) => {
    return {
        headerTitle: 'Cart'
    }
}

const styles = StyleSheet.create({
    screen: {

        margin: 20,

    },
    summary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 10,
    },
    summaryText: {
        fontFamily: 'open-sans-bold',
        fontSize: 18
    },
    amount: {
        color: Colors.primary

    },
});

export default CartScreen;
