import {DEMO_MODE} from '../demo/config';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../config/theme';
import {RestaurantLogo} from '../assets';
import {fetchShopDetails, actionLogout, deleteAccount} from '../redux/reducers/auth';

export default function MoreScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const userId = useSelector(state => state.Auth.userId);

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false); // ✅ Delete modal state
  const initialShop = useSelector(state => state.Auth.shopDetails);
  const [shop, setShop] = useState(initialShop);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const getShop = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchShopDetails(userId)).unwrap();
        setShop(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getShop();
  }, [dispatch, userId]);

  const handleConfirmLogout = () => {
    setLogoutVisible(false);
    dispatch(actionLogout());

    navigation.reset({
      index: 0,
      routes: [{name: 'SignInScreen'}],
    });
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setDeleteLoading(true);
    try {
      const resultAction = await dispatch(deleteAccount(userId));
      if (deleteAccount.fulfilled.match(resultAction)) {
        alert(resultAction.payload?.msg || 'Account deleted successfully.');
        setDeleteVisible(false);
        dispatch(actionLogout());
        navigation.reset({
          index: 0,
          routes: [{name: 'SignInScreen'}],
        });
      } else {
        alert(resultAction.payload || 'Failed to delete account.');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <View style={{flex: 1}}>
      {/* 🔹 Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.moreTextDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More Details</Text>
        <View style={{width: 24}} />
      </View>

      {/* 🔹 Shop Info (Trendy Look) */}
      <View style={styles.shopCard}>
        <Image
          source={shop?.image && !loading ? (typeof shop.image === "string" ? {uri: shop.image} : shop.image) : RestaurantLogo}
          style={styles.shopImage}
          resizeMode="contain"
        />
        <Text style={styles.shopName}>
          {!loading && shop?.name ? shop.name : '--'}
        </Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          {DEMO_MODE && <MenuItem icon="bell-outline" title="Notifications" onPress={() => navigation.navigate('NotificationsScreen')} />}
          <MenuItem icon="file-document-outline" title="Terms & Conditions" onPress={() => navigation.navigate('TermsScreen')} />
          <MenuItem icon="shield-outline" title="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicyScreen')} />
          <MenuItem
            icon="account"
            title="Profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <MenuItem
            icon="message-text-outline"
            title="Support"
            onPress={() => navigation.navigate('CustomerSupportScreen')}
          />
          <MenuItem
            icon="logout"
            title="Logout"
            onPress={() => setLogoutVisible(true)}
          />
           <MenuItem
            icon="delete"
            title="Delete Account"
            onPress={() => setDeleteVisible(true)}
          />
        </View>
      </ScrollView>

      {/* 🔹 Logout Modal */}
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

      {/* 🔹 Delete Account Modal */}
      <Modal
        transparent
        visible={deleteVisible}
        animationType="fade"
        onRequestClose={() => !deleteLoading && setDeleteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, {color: 'red'}]}>
              Delete Account
            </Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setDeleteVisible(false)}
                disabled={deleteLoading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {backgroundColor: 'red'}]}
                onPress={handleDeleteAccount}
                disabled={deleteLoading}>
                {deleteLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmText}>Delete</Text>
                )}
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
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingTop: 45,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.moreTextDark,
    marginLeft: 15,
  },

  // 🔹 Shop card below header
  shopCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    //borderBottomWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    //shadowOpacity: 0.08,
    //shadowRadius: 5,
   // shadowOffset: {width: 0, height: 2},
  },
  shopImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginBottom: 10,
   // borderWidth: 2,
   // borderColor: colors.morePrimary,
  },
  shopName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.moreTextDark,
  },

  container: {
    flex: 1,
    backgroundColor: colors.moreBackground,
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
