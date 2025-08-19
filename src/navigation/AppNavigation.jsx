import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MoreScreen from '../screens/AuthenticationScreens/SignInScreen';
import AddFoodScreen from '../screens/MyAccountScreens/AddFoodScreen';
import CustomerSupportScreen from '../screens/MyAccountScreens/CustomerSupportScreen';
import PrivacyPolicyScreen from '../screens/MyAccountScreens/PrivacyPolicyScreen';
import TermsScreen from '../screens/MyAccountScreens/TermsScreen';
import SignInScreen from '../screens/AuthenticationScreens/SignInScreen';
import ForgotPassword from '../screens/AuthenticationScreens/ForgotPassword';
import VerificationScreen from '../screens/AuthenticationScreens/VerificationScreen';
import BottomTabNavigation from './BottomTabNavigation';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';
import OrdersScreen from '../screens/OrdersScreen';
import MenuScreen from '../screens/MenuScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import BillSummary from '../screens/BillSummary';



const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="BottomTabNavigation"
          component={BottomTabNavigation}
        />

        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen
          name="VerificationScreen"
          component={VerificationScreen}
        />
                <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
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

        <Stack.Screen
          name="AdvertisementsCarousel"
          component={AdvertisementsCarousel}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
