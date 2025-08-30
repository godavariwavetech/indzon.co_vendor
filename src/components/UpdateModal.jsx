// src/components/UpdateModal.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import VegNonVegIcon from './VegNonVegIcon';

const UpdateModal = ({
  visible,
  onClose,
  item,
  menuPrice,
  discountPrice,
  setMenuPrice,
  setDiscountPrice,
  onUpdate,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.updateCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" size={22} color="#333" />
          </TouchableOpacity>

          <View style={styles.row}>
            <VegNonVegIcon isVeg={item?.isVeg} />
            <Text style={styles.modalTitle}>{item?.name}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Menu Price</Text>
          <TextInput
            style={styles.inputBox}
            value={menuPrice}
            keyboardType="numeric"
            onChangeText={setMenuPrice}
          />

          <Text style={styles.label}>
            Discount Price <Text style={styles.optionalText}>(Optional)</Text>
          </Text>
          <TextInput
            style={styles.inputBox}
            value={discountPrice}
            keyboardType="numeric"
            onChangeText={setDiscountPrice}
          />

          <View style={styles.bottomRow}>
            <Text style={styles.totalText}>
              Total Amount : ₹
              {menuPrice && discountPrice
                ? menuPrice - discountPrice
                : menuPrice}
            </Text>
            <TouchableOpacity style={styles.updateBtn} onPress={onUpdate}>
              <Text style={styles.updateBtnText}>Update</Text>
              <Icon
                name="play"
                size={14}
                color={colors.menuCardBg}
                style={styles.playIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateCard: {
    width: 340,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 20,
    elevation: 4,
  },
  closeBtn: {position: 'absolute', top: 10, right: 10, padding: 6, zIndex: 1},
  row: {flexDirection: 'row', alignItems: 'center'},
  modalTitle: {fontSize: 15, fontWeight: '500', color: '#1A43BF'},
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.black4,
    marginVertical: 15,
  },
  label: {fontSize: 14, fontWeight: '500', marginBottom: 8},
  optionalText: {color: colors.searchOutline},
  inputBox: {
    height: 45,
    borderWidth: 0.5,
    borderColor: colors.black6,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black4,
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 8,
  },
  totalText: {color: colors.textWhite, fontSize: 14, fontWeight: '500'},
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 19,
  },
  updateBtnText: {color: colors.white, fontWeight: '500', fontSize: 13},
  playIcon: {marginLeft: 5},
});
