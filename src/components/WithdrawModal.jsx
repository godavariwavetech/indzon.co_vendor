// src/components/WithdrawModal.jsx
import React, {useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';

export default function WithdrawModal({
  visible,
  onClose,
  showSuccess,
  setShowSuccess,
}) {
  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [ onClose, setShowSuccess,showSuccess]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {showSuccess ? (
          <View style={styles.successCard}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Icon name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>

            <View style={styles.successCircle}>
              <Icon name="checkmark" size={40} color={colors.textWhite} />
            </View>

            <Text style={styles.successText}>
              “Your applied for Withdraw Request“
            </Text>

            <View style={styles.successDivider} />

            <TouchableOpacity
              style={styles.thanksWrapper}
              onPress={onClose}>
              <Text style={styles.successThanks}>Yahooo! Thanks</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.withdrawCard}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Icon name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>

            <Text style={styles.cardTitle}>Withdraw</Text>

            <View style={styles.bankIconWrapper}>
              <Icon name="cash-outline" size={40} color={colors.primary} />
            </View>

            <Text style={styles.inputLabel}>Enter Amount</Text>
            <TextInput
              placeholder="₹0.00"
              keyboardType="numeric"
              style={styles.inputBox}
            />

            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => setShowSuccess(true)}>
              <Text style={styles.cardButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.earningsModalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawCard: {
    width: 375,
    height: 311,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  cardTitle: {fontSize: 18, fontWeight: '600', marginBottom: 15},
  bankIconWrapper: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  inputLabel: {alignSelf: 'flex-start', marginBottom: 5, fontSize: 14},
  inputBox: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  cardButton: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonText: {color: colors.textWhite, fontSize: 16, fontWeight: '600'},

  // success
  successCard: {
    width: 300,
    height: 266,
    backgroundColor: colors.earningsSuccessBg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  successDivider: {
    height: 1,
    backgroundColor: colors.earningsSuccessDivider,
    width: '100%',
    marginVertical: 10,
  },
  successThanks: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  thanksWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
});
