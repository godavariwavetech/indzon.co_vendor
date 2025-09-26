import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';
import {colors} from '../config/theme'; 
export default function MoreScreen() {
  const navigation = useNavigation();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleConfirmLogout = () => {
    setLogoutVisible(false);
   
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        {/* 🔹 Hide carousel when modal is visible */}
        {!logoutVisible && (
          <AdvertisementsCarousel navigation={navigation} />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <MenuItem
            icon="account"
            title="Profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <MenuItem
            icon="silverware-fork-knife"
            title="Add Food"
            onPress={() => navigation.navigate('AddFoodScreen')}
          />
          <MenuItem
            icon="message-text-outline"
            title="Customer care support"
            onPress={() => navigation.navigate('CustomerSupportScreen')}
          />
          <MenuItem
            icon="file-lock-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
          <MenuItem
            icon="file-lock-outline"
            title="Terms & Conditions"
            onPress={() => navigation.navigate('TermsScreen')}
          />
          <MenuItem
            icon="logout"
            title="Logout"
            onPress={() => setLogoutVisible(true)}
          />
        </View>
      </ScrollView>

      {/* 🔹 Modal */}
      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setLogoutVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirmLogout}>
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


function MenuItem({icon, title, onPress}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={22} color={colors.moreIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.moreChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.moreBackground,
    paddingTop: 40,
  },
  section: {
    backgroundColor: colors.moreBackground,
    borderRadius: 11,
    padding: 15,
    elevation: 5,
    shadowColor: colors.moreShadow,
    shadowOpacity: 0.07,
    shadowRadius: 13.6,
    shadowOffset: {width: 0, height: 0},
    margin: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.moreTextDark,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.morePrimary,
    paddingLeft: 8,
    marginLeft: -15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: colors.moreTextDark,
    marginLeft: 10,
  },
  // 🔹 Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
        alignItems: 'center',

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.moreTextDark,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.moreTextDark,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  confirmButton: {
    backgroundColor: colors.morePrimary,
  },
  cancelText: {
    color: colors.moreTextDark,
    fontWeight: '500',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '500',
  },
});
