import React, {useState, useEffect} from "react";
import { Text } from "react-native-paper";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import {openDatabase} from 'react-native-sqlite-storage';

function ItemsBought() {
    let db = openDatabase({ name: 'grocery.db'});
    const [items, setItems] = useState([]);
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

                    setItems(arr);
                }
            );
        });
    }

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

    useEffect(() => {
        fetchItems();
      }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Name</Text>
                <Text>Quantity</Text>
                <Text>Action</Text>
            </View>
            <FlatList 
                data={items}
                renderItem={({item,index}) => 
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
                }
                refreshing={refreshing}
                onRefresh={refreshItemsList}
            />
        </View>
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
      backgroundColor: '#55BCF6',
    },
    qty: {
        marginStart: 50
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