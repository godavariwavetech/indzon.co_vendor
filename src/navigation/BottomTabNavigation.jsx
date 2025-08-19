import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MoreScreen from '../screens/MoreScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MenuScreen from '../screens/MenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EarningsScreen from '../screens/EarningsScreen';


const Tab = createBottomTabNavigator();


const BottomTabNavigation = () => {
  //const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarButton: props => (
            <Pressable
              {...props}
              android_ripple={null} // Disable ripple effect on Android
              style={({pressed}) => [
                props.style,
                {opacity: pressed ? 1 : 1}, // Set opacity to 1 to remove the press effect
              ]}
            />
          ),
          tabBarIcon: ({focused, color, size}) => {
            switch (route.name) {
              case 'Orders':
                return (
                  <Ionicons
                    name={ 'reader' }
                    size={21}
                    color={color}
                  />
                );
              case 'Menu':
                return (
                  <Ionicons
                    name={'grid'}
                    size={21}
                    color={color}
                  />
                );
              case 'Reports':
                return (
                  <Ionicons
                    name={ 'document-text'}
                    size={21}
                    color={color}
                  />
                );
              case 'Earnings':
                return (
                  <Ionicons
                    name={'wallet'}
                    size={21}
                    color={color}
                  />
                );
              case 'More':
                return (
                  <Ionicons
                    name={
                      'ellipsis-horizontal-circle-sharp'
                        
                    }
                    size={21}
                    color={color}
                  />
                );
              default:
                return null;
            }
          },

          tabBarLabel: ({focused, color}) => (
            <Text
              style={{
                color: color,
                fontSize: 11,
                fontWeight: "700",
              }}>
              {route.name}
            </Text>
          ),
          tabBarActiveTintColor: '#1A43BF', // pink color
          tabBarInactiveTintColor: '#6E6E6E', // gray color
          tabBarStyle: {
            height: 70,
            paddingTop: 7,
            paddingLeft: 8,
            paddingRight: 8,
           
          },
        })}>
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="More" component={MoreScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigation;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  text: {fontSize: 20},
});
