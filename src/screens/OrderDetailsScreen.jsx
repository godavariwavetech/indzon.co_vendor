import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../config/theme';
import {ItemLogo} from '../assets/index';
import emoji from '../assets/emoji.png';


export default function OrderDetailsScreen({route}) {
  const {order} = route.params;
  const navigation = useNavigation();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState(
  order.status === 'Pending' ? 'Placed' : 'Accepted'
);

const [otp, setOtp] = useState(
  order.status !== 'Pending' ? order.customerOtp?.toString() || null : null
);


  const handleRejectConfirm = () => {
    console.log(`Order ${order.id} rejected`);
    setShowRejectModal(false);
  };

  const handleConfirm = () => {
    setOrderStatus('Accepted');
    // Generate random 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000);
    setOtp(generatedOtp.toString());
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainerStyle}>
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID - {order.id}</Text>
          <Text style={styles.orderTime}>
            {order.date} {order.time}
          </Text>
          <View style={styles.divider} />

          {/* ✅ Status Tracker Row */}
          <View style={styles.statusRow}>
           {['Placed', 'Accepted', 'Ongoing', 'Delivered'].map((step, index) => {
  const stepOrder = ['Placed', 'Accepted', 'Ongoing', 'Delivered'];
  const currentIndex = stepOrder.indexOf(orderStatus);
  const isActive = stepOrder.indexOf(step) <= currentIndex;

  return (
    <View key={index} style={styles.statusItem}>
      <View
        style={[
          styles.statusCircle,
          {backgroundColor: isActive ? colors.success : '#ccc'},
        ]}>
        <MaterialCommunityIcons
          name={
            step === 'Placed'
              ? 'map-marker'
              : step === 'Accepted'
              ? 'check'
              : step === 'Ongoing'
              ? 'bike'
              : 'map-marker-check'
          }
          size={16}
          color={'#fff'}
        />
      </View>
      <Text
        style={[
          styles.statusLabel,
          {color: isActive ? colors.success : '#999'},
        ]}>
        {step}
      </Text>
      {index < 3 && <View style={styles.statusLine} />}
    </View>
  );
})}

          </View>

          <View style={styles.divider2} />

          {order.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Image source={ItemLogo} style={styles.logo} />
              <MaterialCommunityIcons
                name="square-circle"
                size={16}
                color={item.isVeg ? 'green' : 'red'}
                style={{marginRight: 6}}
              />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Footer Row */}
          <View style={styles.footerRow}>
            <View style={styles.billLeft}>
              <Text style={styles.totalBillLabel}>Total Bill</Text>
              <View style={styles.paymentBadge}>
                <View style={styles.dot} />
                <Text style={styles.paymentText}>
                  {order.paymentMethod || 'COD'}
                </Text>
              </View>
            </View>
            <Text style={styles.totalPrice}>₹{order.total}</Text>
          </View>

          {/* ✅ Replace buttons with OTP after confirmation */}
          {!otp ? (
            order.status === 'Pending' && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => setShowRejectModal(true)}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>Confirm Now</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View>
              <View style={styles.otpContainer}>
                <Text style={styles.otpTitle}>Order OTP</Text>
                <View style={styles.otpBox}>
                  {otp.split('').map((digit, index) => (
                    <Text key={index} style={styles.otpDigit}>
                      {digit}
                    </Text>
                  ))}
                </View>
              </View>

              {/* //after otp entered by delivery boy */}

              {/* <View style={styles.card3}>
                <Image source={emoji} style={styles.avatar3} />
                <View style={styles.textContainer}>
                  <Text style={styles.subtitle3}>Manoj is on the way</Text>
                  <Text style={styles.orderId3}>
                    ORDER ID : <Text style={styles.bold}>4254248142121</Text>
                  </Text>
                </View>
                <TouchableOpacity>
                  <Icon name="call" size={20} color="#1A43BF" />
                </TouchableOpacity>
              </View> */}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reject Confirmation Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reject Order?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reject this order?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRejectModal(false)}>
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton2]}
                onPress={handleRejectConfirm}>
                <Text style={styles.confirmButton2Text}>Yes, Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: colors.textWhite,
    elevation: 5,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  backButton: {marginRight: 10},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#000'},
  contentContainerStyle: {paddingBottom: 20},

  orderCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    marginTop: 30,
  },
  orderId: {fontSize: 16, fontWeight: 'bold', color: colors.primary},
  orderTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMedium,
    marginTop: 4,
  },
  divider: {height: 1, backgroundColor: colors.divider, marginVertical: 10},
  divider2: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
    marginBottom: 30,
  },

  /* ✅ Status Row Styles */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    position: 'relative',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 14,
    right: -25,
    height: 2,
    width: 50,
    backgroundColor: '#ccc',
    zIndex: -1,
  },

  /* Item Styles */
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemQuantity: {
    marginRight: 6,
    fontWeight: '500',
    borderWidth: 0.5,
    paddingHorizontal: 7,
    padding: 4,
    borderRadius: 5,
    backgroundColor: '#1A43BF1F',
  },
  itemName: {flex: 1, fontSize: 14},
  itemPrice: {fontWeight: 'bold'},
  logo: {width: 33, height: 33, borderRadius: 50, marginRight: 5},

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  billLeft: {flexDirection: 'row', alignItems: 'center'},
  totalBillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginRight: 10,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7ECFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
    marginRight: 5,
  },
  paymentText: {fontSize: 12, fontWeight: '500', color: '#1E40AF'},
  totalPrice: {fontSize: 16, fontWeight: 'bold', color: '#000'},

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rejectButton: {
    flex: 0.7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rejectButtonText: {color: colors.danger, fontWeight: 'bold'},
  confirmButton: {
    flex: 1.3,
    marginLeft: 8,
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {color: colors.textWhite, fontWeight: 'bold'},

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  modalMessage: {fontSize: 14, textAlign: 'center', marginBottom: 20},
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {backgroundColor: '#ddd'},
  cancelButtonText: {color: '#333', fontWeight: 'bold'},
  confirmButton2: {backgroundColor: colors.primarySemi},
  confirmButton2Text: {color: '#fff', fontWeight: 'bold'},
  otpContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpBox: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '70%',
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginHorizontal: 6,
  },


  card3: {
    borderRadius: 5,
    borderWidth: 0.65,
    borderColor: colors.borderLight,
    opacity: 1,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginVertical: 10,
  },
  avatar3: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle3: {
    fontSize: 13,
    color: colors.textMedium,
    marginBottom: 2,
  },
  orderId3: {
    fontSize: 13,
    color: colors.textDark,
  },
  bold: {
    fontWeight: '600',
  },



});
