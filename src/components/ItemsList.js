import React, {useState, useEffect, useContext} from "react";
import { Text } from "react-native-paper";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Keyboard, Platform, TextInput } from "react-native";
import {openDatabase} from 'react-native-sqlite-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import {ItemsContext} from '../context'

function ItemsList() {
    let db = openDatabase({ name: 'grocery.db'});
    const [item, setItem] = useState(null);
    const [qty, setQty] = useState(null);
    const [price, setPrice] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { items, setItems, itemsBought, setItemsBought } = useContext(ItemsContext);

    const refreshItemsList = () => {
        setRefreshing(true);
        fetchItems();
        setRefreshing(false);
    } 

    const addItem = () => {
        Keyboard.dismiss();
        db.transaction((txn) => {
            txn.executeSql(
                'INSERT INTO items(name, qty, bought, price) values(?,?,?,?)',
                [item,qty,0,price],
                (tx, res) => {
                    if(!res.rowsAffected) {
                        Toast.show('Something went wrong! Try again', Toast.SHORT);
                    } else {
                        Toast.show('New Item added successfully!', Toast.SHORT);
                        refreshItemsList();
                    } 
                }
            );
        });

        setItem(null)
        setQty(null)
        setPrice(null)
        
    }

    const deleteItem = (id, index) => {
        db.transaction((txn) => {
            txn.executeSql(
                "DELETE from items where id = ?",
                [id],
                (tx, res) => {
                    if(res.rowsAffected) {
                        splice(index);
                        Toast.show('Item Deleted Successfully!', Toast.SHORT);
                    } else {
                        Toast.show('Something went wrong! Try again', Toast.SHORT);
                    }                    
                }
            )
        })
    }

    const showConfirmDialog = (id, index) => {
        return Alert.alert(
          "Are your sure?",
          "Are you sure you want to delete this item permanently?",
          [
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "No",
            },
            // The "Yes" button
            {
                text: "Yes",
                onPress: () => {
                  deleteItem(id,index);
                },
            }
          ]
        );
      };

    const splice = (index) => {
        let itemsCopy = [...items];
        itemsCopy.splice(index, 1);
        setItems(itemsCopy);
    }

    const markItemAsBought = (item,index) => {
        let bought = item.bought;
        
        db.transaction((txn) => {
            txn.executeSql(
                "UPDATE items set bought = ? where id = ?",
                [!bought,item.id],
                (tx, res) => {
                    if(res.rowsAffected) {
                        splice(index);
                        setItemsBought([...itemsBought, item])
                        Toast.show('Item added to cart successfully!', Toast.SHORT);
                    } else {
                        Toast.show('Something went wrong! Try again', Toast.SHORT);
                    }                    
                }
            )
        })
    }

    const createTable = () => {
        db.transaction((txn) => {
            txn.executeSql(
              "SELECT name FROM sqlite_master WHERE type='table' AND name='items'",
              [],
              (tx, res) => {
                if (res.rows.length == 0) {
                  txn.executeSql('DROP TABLE IF EXISTS items', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(30), qty VARCHAR(15), bought INTEGER, price INTEGER)',
                    []
                  );
                }
              }
            );
        });
    }

    const fetchItems = () => {
        db.transaction((txn) => {
            txn.executeSql(
                'select * from items where bought=?',
                [0],
                (tx, res) => {
                    let arr = [];
                    let index = 1;
                    for(let i=0; i < res.rows.length; i++) {
                        let row = res.rows.item(i); 
                        row.index = index;
                        index++;
                        arr.push(row);
                    }

                    setItems(arr);
                }
            );
        });
    }

    useEffect(() => {
        createTable();
        fetchItems();
      }, []);

    return (
        <>
            <View style={styles.container} >
                <View style={styles.header}>
                    <Text>Item's Name</Text>
                    <Text>Quantity</Text>
                    <Text>Price(Rs.)</Text>
                    <Text>Action</Text>
                </View>
                <FlatList 
                    data={items}
                    keyExtractor={(items, index) => String(index)}
                    renderItem={({item,index}) => 
                        <View style={styles.header}>
                            <View style={{flexDirection: 'row', width: 80}}>
                                <View style={styles.square}>
                                    <Text style={styles.index}>{item.index}</Text>
                                </View>
                                <Text>{item.name}</Text>
                            </View>
                            <Text style={{width: 40}}>{item.qty}</Text>
                            <Text>{item.price}</Text>
                            <View style={{flexDirection: 'row'}}>
                            <TouchableOpacity style={{marginEnd: 5}} onPress={() => showConfirmDialog(item.id, index)}>
                                <MaterialCommunityIcons name="trash-can-outline" color={'#FF0000'} size={25} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => markItemAsBought(item, index)}>
                                <MaterialCommunityIcons name="cart-arrow-down" color={'#4BB543'} size={25} />
                            </TouchableOpacity>
                            </View>
                            
                        </View>
                    }
                    refreshing={refreshing}
                    onRefresh={refreshItemsList}
                />
            </View>
            <View>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} style={styles.addItemWrapper}>
                    <TextInput style={styles.addItemInput} placeholderTextColor="#000" placeholder="Write an Item name"
                        onChangeText={text => setItem(text)} value={item}/>
                    <TextInput style={styles.addItemInputQty} placeholderTextColor="#000" placeholder="Qty" 
                        onChangeText={text => setQty(text)} value={qty} />
                    <TextInput style={styles.addItemInputQty} placeholderTextColor="#000" placeholder="Price" 
                        onChangeText={text => setPrice(text)} value={price} />
                    <TouchableOpacity onPress={() => addItem()}>
                        <View style={styles.addItemBtnWrapper}>
                            <Text style={styles.addItemBtn}>
                                <MaterialCommunityIcons name="plus" color={'#fff'} size={25} />
                            </Text>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

            </View>
        </>
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
    addItemWrapper: {
        position: 'absolute',
        bottom: 12,
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center"
    },

    addItemInput: {
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderColor: "#55BCF6",
        borderWidth: 1,
        width: 150,
        color: '#000'
    },

    addItemInputQty: {
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderColor: "#55BCF6",
        borderWidth: 1,
        width: 70,
        color: '#000'
    },

    addItemBtnWrapper: {
        width: 60,
        height: 60,
        backgroundColor: "#fff",
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#55BCF6'
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

    addItemBtn: {
    }
  });

  export default ItemsList;
  