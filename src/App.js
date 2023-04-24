import React, {useEffect} from "react";
import ItemsList from "./components/ItemsList";
import ItemsBought from "./components/ItemsBought";
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ItemsProvider } from './context';

const Tab = createBottomTabNavigator();

function App() {

  useEffect(() => {
    setTimeout(function() {
      SplashScreen.hide();
    }, 1500)
  }, []);

  return (
    <ItemsProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#55BCF6',
            headerShown: false
          }}>
          <Tab.Screen name="Items" component={ItemsList} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
              ),
            }}/>
          <Tab.Screen name="Cart" component={ItemsBought} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cart-variant" color={color} size={size} />
              ),
            }}/>    
              
        </Tab.Navigator>
      </NavigationContainer>
    </ItemsProvider>
  );
}

export default App;
