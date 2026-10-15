import React from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';
import {colors} from '../../config/theme';
import {DEMO_MODE} from '../../demo/config';
import Production from './TermsScreen.production';
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
        Terms & Conditions
      </Text>
      {[
        'Use Indzon.co Vendor to manage your catalogue, inventory and order workflow.',
        'Catalogue and order changes are retained for the current app session. Purchases and payment processing are unavailable.',
        'Restarting the app restores the initial records. Contact support for help with your account.',
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
