import React from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../config/theme';

const TermsScreen = ({navigation}) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={colors.textWhite} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Terms and Conditions</Text>
    </View>
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <Text style={styles.updateText}>Sample content - draft for vendor app demonstration.</Text>
      <Text style={styles.heading}>1. About the Vendor App</Text>
      <Text style={styles.paragraph}>The vendor app helps restaurants and shops manage their business profile, product listings, incoming orders, availability, and earnings. These sample terms describe the responsibilities of vendors using the platform.</Text>

      <Text style={styles.heading}>2. Vendor Account</Text>
      <Text style={styles.paragraph}>Keep your business name, contact details, address, and settlement information accurate and up to date. You are responsible for access to your account and for the actions of staff who use it. Contact support if you suspect unauthorized access.</Text>

      <Text style={styles.heading}>3. Products and Pricing</Text>
      <Text style={styles.paragraph}>Provide accurate product names, descriptions, prices, images, and availability. Include relevant ingredient, allergen, and preparation information where appropriate. Update unavailable items promptly and avoid misleading listings.</Text>

      <Text style={styles.heading}>4. Order Management</Text>
      <Text style={styles.paragraph}>Review incoming orders promptly and accept only orders you can fulfill. Prepare accepted orders within the communicated time, use suitable packaging, and coordinate pickup with delivery partners. Report delays, cancellations, or unavailable items through the available support channels.</Text>

      <Text style={styles.heading}>5. Quality and Business Responsibilities</Text>
      <Text style={styles.paragraph}>You are responsible for the quality, safety, and accuracy of the products you supply. Maintain the registrations and permissions applicable to your business and ensure your staff follow appropriate hygiene and handling practices.</Text>

      <Text style={styles.heading}>6. Fees and Settlements</Text>
      <Text style={styles.paragraph}>Order totals, platform fees, adjustments, and settlement details should be reviewed in the app and in your separate commercial agreement. Report discrepancies to support. This sample text does not set commission rates, settlement timelines, or refund amounts.</Text>

      <Text style={styles.heading}>7. Cancellations and Refunds</Text>
      <Text style={styles.paragraph}>Handle order issues promptly and cooperate with support when an item is missing, incorrect, or unavailable. Any cancellation charges, refunds, or settlement adjustments are subject to the applicable order details and commercial agreement.</Text>

      <Text style={styles.heading}>8. Customer Information</Text>
      <Text style={styles.paragraph}>Use customer information only to prepare, fulfill, or resolve issues with an order. Do not use customer contact details for unrelated marketing or share them outside the order fulfillment process.</Text>

      <Text style={styles.heading}>9. Acceptable Use and Account Closure</Text>
      <Text style={styles.paragraph}>Do not create fraudulent orders, misuse customer information, upload misleading content, or interfere with the platform. Account access may be reviewed when misuse is reported. Contact support for account closure or unresolved issues.</Text>

      <Text style={styles.heading}>10. Updates and Support</Text>
      <Text style={styles.paragraph}>These sample terms may be replaced with the final vendor agreement. For questions about orders, payments, or your account, use Customer Support in the app.</Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backButton: {padding: 12},
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textWhite,
  },
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

export default TermsScreen;