import React, {useState, useEffect, useContext} from "react";
import { Text } from "react-native-paper";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {openDatabase} from 'react-native-sqlite-storage';
import Toast from 'react-native-simple-toast';
import {ItemsContext} from '../context'

function ItemsBought() {
    let db = openDatabase({ name: 'grocery.db'});
    const { items, setItems, itemsBought, setItemsBought, itemsTotal, setItemsTotal, itemsBoughtTotal, setItemsBoughtTotal } = useContext(ItemsContext);

    const [total, setTotal] = useState(0);

    const [refreshing, setRefreshing] = useState(false);

    const refreshItemsList = () => {
        setRefreshing(true);
        fetchItems();
        setRefreshing(false);
    } 

    const fetchItems = () => {
        db.transaction((txn) => {
            txn.executeSql(
                'select * from items where bought=?',
                [1],
                (tx, res) => {
                    let arr = [];
                    let index = 1;
                    for(let i=0; i < res.rows.length; i++) {
                        let row = res.rows.item(i); 
                        row.index = index;
                        index++;
                        arr.push(row);
                    }

                    setItemsBought(arr);
                }
            );

            txn.executeSql(
                'select sum(price) as total from items where bought=?',
                [1],
                (tx, res) => {
                    if(res.rows.length) {
                        setItemsBoughtTotal(res.rows.item(0).total)
                    }
                }
            );
        });
    }

    const markItemAsBought = (item,index) => {
        let bought = item.bought;
        
        db.transaction((txn) => {
            txn.executeSql(
                "UPDATE items set bought = ? where id = ?",
                [!bought,item.id],
                (tx, res) => {
                    if(res.rowsAffected) {
                        setItemsTotal(itemsTotal+item.price)
                        fetchItems();
                        setItems([...items, item])
                        Toast.show('Item removed from cart successfully!', Toast.SHORT);
                    } else {
                        Toast.show('Something went wrong! Try again', Toast.SHORT);
                    }                    
                }
            )
        })
    }

    useEffect(() => {
        fetchItems();
      }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Item's Name</Text>
                <Text>Quantity</Text>
                <Text>Price(Rs)</Text>
                <Text>Action</Text>
            </View>
            <FlatList 
                data={itemsBought}
                renderItem={({item,index}) => 
                <View style={styles.header}>
                    <View style={{flexDirection: 'row', width: 80}}>
                        <View style={styles.square}>
                            <Text style={styles.index}>{item.index}</Text>
                        </View>
                        <Text>{item.name}</Text>
                    </View>
                    <Text style={{width: 50}}>{item.qty}</Text>
                    <Text style={{width: 50}}>{item.price ? item.price.toLocaleString("en-US") : <></>}</Text>
                    <TouchableOpacity onPress={() => markItemAsBought(item, index)}>
                        <MaterialCommunityIcons name="cart-arrow-up" color={'#FF0000'} size={25} />
                    </TouchableOpacity>
                </View>
                }
                refreshing={refreshing}
                onRefresh={refreshItemsList}

                ListFooterComponent={itemsBought.length ? () => <View style={styles.header}>
                        <Text style={{fontWeight: 900}}>Total</Text>
                        <Text style={{fontWeight: 900}}>Rs. {itemsBoughtTotal ? itemsBoughtTotal.toLocaleString("en-US") : 0}</Text>
                    </View> : <></>}
            />
        </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 18,
        backgroundColor: '#808080',
        paddingBottom: 80
    },
    square: {
      width: 20,
      height: 20,
      backgroundColor: '#55BCF6',
      opacity: 0.4,
      borderRadius: 5,
      marginRight: 5,
      justifyContent: "center",
      alignItems: "center"
    },
    index: {
        color: "#1162a1",
        fontWeight: "bold"
    },
    itemText: {
      maxWidth: '80%',
    },

    header: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
  });

  export default ItemsBought;