import React from 'react';
import {Button, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Colors from '../../constants/Colors';
import * as cartActions from '../../store/actions/cart';
import {vw} from "react-native-expo-viewport-units";

const ProductDetailScreen = (props) => {
    // get the product id from route
    const productId = props.route.params.productId;
    // Selecting item from list using Hooks and JS find function
    const selectedProduct = useSelector(state =>
        state.products.availableProducts.find(prod => prod.id === productId)
    );

    const dispatch = useDispatch();
    return (
        <ScrollView>
            {/* Show Base64 Image image  */}
            <Image style={styles.image} source={{uri: `data:image/png;base64,${selectedProduct.imageUrl}`}}/>
            <View style={styles.actions}>
                {/* Add to card button  */}
                <Button color={Colors.primary} title="Add to Cart" onPress={() => {
                    dispatch(cartActions.addToCart(selectedProduct));
                }}/>
            </View>
            <Text style={styles.price}>RM {selectedProduct.price.toFixed(2)} </Text>
            <Text style={styles.description}>{selectedProduct.description} </Text>
        </ScrollView>
    );
};

export const screenOptions = (navData) => {
    return {
        headerTitle: navData.route.params.productTitle
    };
};

const styles = StyleSheet.create({
    image: {
        width: vw(100),
        height: 300
    },
    actions: {
        marginVertical: 10,
        alignItems: 'center'
    },
    price: {
        fontSize: 20,
        color: '#888',
        textAlign: 'center',
        marginVertical: 20,
        fontFamily: 'open-sans-bold'
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 20,
        fontFamily: 'open-sans'
    }
});

export default ProductDetailScreen;
