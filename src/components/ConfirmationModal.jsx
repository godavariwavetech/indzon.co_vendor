// src/components/ConfirmationModal.jsx
import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';

const ConfirmationModal = ({visible, onClose, message = "Your request was completed successfully"}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.confirmCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={22} color={colors.closeButton} />
          </TouchableOpacity>
          <View style={styles.checkContainer}>
            <Icon name="checkmark-circle" size={64} color="green" />
          </View>
          <Text style={styles.confirmText}>{message}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.thanksText}>Yahooo! Thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: 300,
    height: 266,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.closeButton,
    textAlign: 'center',
    marginBottom: 20,
  },
  thanksText: {fontSize: 16, fontWeight: '600', color: colors.editBtn},
  checkContainer: {alignItems: 'center', marginBottom: 15},
  closeBtn: {position: 'absolute', top: 10, right: 10, padding: 6},
});
