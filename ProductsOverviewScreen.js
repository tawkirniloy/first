import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Button, FlatList, Platform, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ProductItem from '../../components/shop/ProductItem';

import * as cartActions from '../../store/actions/cart';
import * as prodActions from '../../store/actions/products';


import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import CustomHeaderButton from '../../components/UI/HeaderButton';
import Colors from '../../constants/Colors';
import {SearchBar} from "react-native-elements";
import {vh} from "react-native-expo-viewport-units";

const ProductsOverviewScreen = (props) => {

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    let products = useSelector(state => state.products.availableProducts);
    let [searchResult, setSearchResult] = useState(products);
    let [searchText, setSearchText] = useState("");
    const dispatch = useDispatch();

    //Load all Products
    const loadProducts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(prodActions.fetchProduct());
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError])

    // Watch for event
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', loadProducts);
        return () => {
            unsubscribe();
        };
    }, [loadProducts])

    // Watch for event
    useEffect(() => {
        setIsLoading(true);
        loadProducts().then(() => {
            setIsLoading(false);
        });

    }, [dispatch, loadProducts])

    const selectItemHandler = (id, title) => {
        props.navigation.navigate('ProductDetail', {
            productId: id,
            productTitle: title
        });
    }
    //If Error Occurred then return this
    if (error) {
        return (
            <View style={styles.centered}>
                <Text>An error occurred.</Text>
                <Button title="Try again" onPress={loadProducts} color={Colors.primary}/>
            </View>
        );
    }
    //If Loading then return this
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary}/>
            </View>
        );
    }
    //If No Product then return this
    if (!isLoading && products.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>No products found. Maybe start adding some!</Text>
            </View>
        );
    }

    const updateSearch = (value) => {
        setSearchText(value);
        setSearchResult(products.filter(x => x.title.toLowerCase().includes(value)))
    };
    return (
        <>
            <SearchBar
                inputStyle={{backgroundColor: '#fefefe',}}
                containerStyle={{backgroundColor: 'white', borderWidth: 0, borderRadius: 2}}
                placeholder="Type Here..."
                value={searchText}
                onChangeText={updateSearch}
                platform={'android'}/>
            <FlatList
                style={{height: vh(80)}}
                onRefresh={loadProducts}
                refreshing={isRefreshing}
                data={searchResult.length > 0 ? searchResult : products}
                keyExtractor={item => item.id}
                renderItem={itemData => (
                    <ProductItem
                        image={itemData.item.imageUrl}
                        title={itemData.item.title}
                        price={itemData.item.price}
                        onSelect={() => {
                            selectItemHandler(itemData.item.id, itemData.item.title);
                        }}
                    >
                        <Button
                            color={Colors.primary}
                            title="View Details"
                            onPress={() => {
                                selectItemHandler(itemData.item.id, itemData.item.title);
                            }}
                        />
                        <Button
                            color={Colors.primary}
                            title="Add"
                            onPress={() => {
                                dispatch(cartActions.addToCart(itemData.item));
                            }}
                        />
                    </ProductItem>
                )}
            />
        </>
    );
};

export const screenOptions = (navData) => {


    const cartItemLen = Object.keys(useSelector(state => state.cart.items)).length;

    return {
        headerTitle: 'All products',
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
        headerRight: () =>
            <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                <Item
                    title="Cart"
                    iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
                    onPress={() => {
                        navData.navigation.navigate('Cart')
                    }}
                />
                <Text style={{fontWeight: 'bold', fontSize: 18, padding: 10}}>{cartItemLen}</Text>
            </HeaderButtons>

    };
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProductsOverviewScreen;
