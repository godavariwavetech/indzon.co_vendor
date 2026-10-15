import React from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';
import {colors} from '../../config/theme';
import {DEMO_MODE} from '../../demo/config';
import Production from './PrivacyPolicyScreen.production';
export default function Policy({navigation}) {
  if (!DEMO_MODE) return <Production />;
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        paddingTop: 55,
        backgroundColor: colors.background,
        flexGrow: 1,
      }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{color: colors.primary}}>Back</Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: colors.textDark,
          marginVertical: 24,
        }}>
        Privacy Policy
      </Text>
      {[
        'Avoid entering sensitive personal or banking information in the app.',
        'Changes stay in app memory. No order, payment, notification or authentication information is sent to a server.',
        'Closing and restarting the application clears session changes and restores the initial records.',
      ].map(p => (
        <Text
          key={p}
          style={{
            color: colors.textDark,
            fontSize: 15,
            lineHeight: 24,
            marginBottom: 18,
          }}>
          {p}
        </Text>
      ))}
    </ScrollView>
  );
}
