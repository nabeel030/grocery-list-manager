import React, {useState, useEffect} from "react";
import { Text } from "react-native-paper";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Keyboard, Platform, TextInput, RefreshControl, ScrollView } from "react-native";
import {openDatabase} from 'react-native-sqlite-storage';

function ItemsList() {
    let db = openDatabase({ name: 'grocery.db'});
    const [item, setItem] = useState(null);
    const [qty, setQty] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [items, setItems] = useState([]);

    const refreshItemsList = () => {
        setRefreshing(true);
        fetchItems();
        setRefreshing(false);
    } 

    const addItem = () => {
        Keyboard.dismiss();
        db.transaction((txn) => {
            txn.executeSql(
                'INSERT INTO items(name, qty, bought) values(?,?,?)',
                [item,qty,0],
                (tx, res) => {
                    if(!res.rowsAffected) {
                        Alert.alert('Something went wrong!');
                    } else {
                        refreshItemsList();
                    } 
                }
            );
        });

        setItem(null)
        setQty(null)
        
    }

    const deleteItem = (id, index) => {
        db.transaction((txn) => {
            txn.executeSql(
                "DELETE from items where id = ?",
                [id],
                (tx, res) => {
                    if(res.rowsAffected) {
                        Alert.alert('Success!', 'Item Deleted Successfully!');
                        splice(index);
                    } else {
                        Alert.alert('Oops!', 'Something went wrong!');
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
            // The "Yes" button
            {
              text: "Yes",
              onPress: () => {
                deleteItem(id,index);
              },
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "No",
            },
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
                    } else {
                        Alert.alert('Oops!', 'Something went wrong!');
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
                console.log('item:', res.rows.length);
                if (res.rows.length == 0) {
                  txn.executeSql('DROP TABLE IF EXISTS items', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(30), qty VARCHAR(15), bought INTEGER)',
                    []
                  );
                } else {
                  console.log("Already created!");
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
                    <Text>Name</Text>
                    <Text>Quantity</Text>
                    <Text>Action</Text>
                </View>
                <FlatList 
                    data={items}
                    keyExtractor={(items, index) => String(index)}
                    renderItem={({item,index}) => 
                    <TouchableOpacity onLongPress={() => showConfirmDialog(item.id, index)}>
                        <View style={styles.item}>
                            <View style={styles.itemLeft}>
                                <View style={styles.square}>
                                    <Text style={styles.index}>{item.index}</Text>
                                </View>
                                <Text style={styles.itemText}>{item.name}</Text>
                                <Text style={styles.qty}>{item.qty}</Text>
                            </View>
                            <TouchableOpacity onPress={() => markItemAsBought(item, index)}>
                                <View style={styles.circular}></View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => addItem()}>
                        <View style={styles.addItemBtnWrapper}>
                            <Text style={styles.addItemBtn}>+</Text>
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
        paddingTop: 22,
        backgroundColor: '#808080',
        paddingBottom: 80
    },
    item: {
      backgroundColor: '#FFF',
      padding: 15,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    square: {
      width: 24,
      height: 24,
      backgroundColor: '#55BCF6',
      opacity: 0.4,
      borderRadius: 5,
      marginRight: 15,
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
    circular: {
      width: 25,
      height: 25,
      borderColor: '#55BCF6',
      borderWidth: 2,
      borderRadius: 50,
    },
    qty: {
        marginStart: 50
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
        borderColor: "#c0c0c0",
        borderWidth: 1,
        width: 200,
        color: '#000'
    },

    addItemInputQty: {
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderColor: "#c0c0c0",
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
        borderColor: "#c0c0c0",
        borderWidth: 1,
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
  