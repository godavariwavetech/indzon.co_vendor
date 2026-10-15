import NotificationsScreen from '../screens/NotificationsScreen';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MoreScreen from '../screens/MoreScreen';
import AddFoodScreen from '../screens/MyAccountScreens/AddFoodScreen';
import CustomerSupportScreen from '../screens/MyAccountScreens/CustomerSupportScreen';
import PrivacyPolicyScreen from '../screens/MyAccountScreens/PrivacyPolicyScreen';
import TermsScreen from '../screens/MyAccountScreens/TermsScreen';
import Profile from '../screens/MyAccountScreens/Profile';

import SplashScreen from '../screens/AuthenticationScreens/SplashScreen';
import SignInScreen from '../screens/AuthenticationScreens/SignInScreen';
import ChangeForgotPassword from '../screens/AuthenticationScreens/ChangeForgotPassword';
import RegisterScreen from '../screens/AuthenticationScreens/RegisterScreen';

import BottomTabNavigation from './BottomTabNavigation';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

import MenuScreen from '../screens/MenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import BillSummary from '../screens/BillSummary';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{headerShown: false}}>
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen
          name="ChangeForgotPassword"
          component={ChangeForgotPassword}
        />

        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen
          name="BottomTabNavigation"
          component={BottomTabNavigation}
        />

        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />

        <Stack.Screen
          name="OrderDetailsScreen"
          component={OrderDetailsScreen}
        />
        <Stack.Screen name="MenuScreen" component={MenuScreen} />
        <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
        <Stack.Screen name="EarningsScreen" component={EarningsScreen} />

        <Stack.Screen name="MoreScreen" component={MoreScreen} />
        <Stack.Screen name="BillSummary" component={BillSummary} />

        <Stack.Screen name="AddFoodScreen" component={AddFoodScreen} />
        <Stack.Screen
          name="CustomerSupportScreen"
          component={CustomerSupportScreen}
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen name="TermsScreen" component={TermsScreen} />
        <Stack.Screen name="Profile" component={Profile} />

        <Stack.Screen
          name="AdvertisementsCarousel"
          component={AdvertisementsCarousel}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
