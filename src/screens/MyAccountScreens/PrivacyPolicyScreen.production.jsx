import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import ScreenHeader from '../../components/ScreenHeader';
import {colors} from '../../config/theme';

const PrivacyPolicyScreen = () => (
  <View style={styles.container}>
    <ScreenHeader title="Privacy Policy" />
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text style={styles.updateText}>Sample content - draft for vendor app demonstration.</Text>
      <Text style={styles.heading}>1. About This Policy</Text>
      <Text style={styles.paragraph}>This sample Privacy Policy describes information that may be involved when vendors use the app to manage their business, orders, and settlements. It is draft content for demonstration and must be updated to match the actual service before publication.</Text>

      <Text style={styles.heading}>2. Business and Account Information</Text>
      <Text style={styles.paragraph}>Information may include your business name, contact name, phone number, email address, shop address, profile image, and business documents provided during registration or account updates.</Text>

      <Text style={styles.heading}>3. Orders and Settlement Information</Text>
      <Text style={styles.paragraph}>Order records, product listings, prices, earnings, settlement details, and support messages may be processed to provide vendor services. Bank details supplied for settlements should be used only for relevant payment and account operations.</Text>

      <Text style={styles.heading}>4. Device Information and Permissions</Text>
      <Text style={styles.paragraph}>The app may use device information and diagnostic data to support its operation. Camera or photo access may be requested when you upload shop or product images. Permission requests should explain their purpose, and you can manage permissions in your device settings.</Text>

      <Text style={styles.heading}>5. How Information Is Used</Text>
      <Text style={styles.paragraph}>Information may be used to manage vendor accounts, display shop listings, process orders, coordinate delivery, provide earnings records, respond to support requests, and investigate technical issues or suspected misuse.</Text>

      <Text style={styles.heading}>6. Information Sharing</Text>
      <Text style={styles.paragraph}>Relevant shop and order information may be shared with customers, delivery partners, and service providers involved in fulfilling orders and operating the platform. The final policy must identify actual sharing practices and any disclosures required by applicable law.</Text>

      <Text style={styles.heading}>7. Customer Data Handled by Vendors</Text>
      <Text style={styles.paragraph}>Customer details visible for an order should be used only for fulfillment and support. Keep this information confidential and avoid copying, retaining, or sharing it for unrelated purposes.</Text>

      <Text style={styles.heading}>8. Storage and Security</Text>
      <Text style={styles.paragraph}>Access to account and business information should be restricted to authorized people. The final policy must describe the actual security practices, retention periods, and handling of records after account closure.</Text>

      <Text style={styles.heading}>9. Your Choices</Text>
      <Text style={styles.paragraph}>You can update supported profile fields in the app and manage device permissions in your device settings. Use Customer Support for questions about account information, access requests, corrections, or account deletion.</Text>

      <Text style={styles.heading}>10. Policy Updates and Contact</Text>
      <Text style={styles.paragraph}>This draft may be replaced with an approved Privacy Policy. For privacy questions, use Customer Support in the app. Final business contact details and the policy effective date should be added before publication.</Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  contentContainer: {padding: 20, paddingBottom: 40},
  updateText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textLight,
    textAlign: 'justify',
  },
});

export default PrivacyPolicyScreen;