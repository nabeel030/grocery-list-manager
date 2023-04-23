import React, {useEffect} from "react";
import ItemsList from "./components/ItemsList";
import ItemsBought from "./components/ItemsBought";
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

function App() {

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer
        initialRouteName="Items to Buy"
        screenOptions={{
          tabBarActiveTintColor: '#e91e63',
        }}
        >
      <Tab.Navigator>
        <Tab.Screen name="Items to Buy" component={ItemsList} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="format-+list-bulleted" color={color} size={size} />
            ),
          }}/>
        <Tab.Screen name="Items Bought" component={ItemsBought} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="playlist-check" color={color} size={size} />
            ),
          }}/>    
             
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
