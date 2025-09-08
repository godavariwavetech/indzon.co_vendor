import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import {Ordersscreenimage, RestaurantLogo} from '../assets/index';

const allOrders = [
  {
    id: '230820257934322',
    status: 'Pending',
    date: '23/08/2025',
    time: '8:00 PM',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',

    items: [
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 900,
    paymentMethod: 'COD',
    cookingRequest: 'Please send extra tissues and spoons.',
  },

  {
    id: '230820257934322',
    status: 'Ongoing',
    paymentMethod: 'COD',
    time: '8:00 PM',
    date: '23/08/2025',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',
    items: [
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
    ],
    total: 900,
  },
];

export default function OrdersScreen({navigation}) {
  const [isOn, setIsOn] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Pending');
  const [showToggleModal, setShowToggleModal] = useState(false);

  const translateX = new Animated.Value(isOn ? 32 : 0);

  const handleToggleConfirm = () => {
    Animated.timing(translateX, {
      toValue: isOn ? 0 : 32,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsOn(!isOn);
    setShowToggleModal(false);
  };

  const orders = allOrders.filter(order => order.status === selectedTab);
  const getTabCount = status =>
    allOrders.filter(order => order.status === status).length;

  const tabs = [
    {label: 'Pending', count: getTabCount('Pending')},
    {label: 'Ongoing', count: getTabCount('Ongoing')},
  ];

  // ✅ Inline OrderCard Component
  const OrderCard = ({order, statusColor, statusLabel, onPressAddress}) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>ID-{order.id}</Text>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.orderTime}>{order.date}</Text>
          <Text style={styles.orderTime}>{order.time}</Text>
        </View>
      </View>

      {/* Status Badge */}
      {/* <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
        <Text style={styles.statusBadgeText}>{statusLabel}</Text>
      </View> */}

      {/* Address */}
      <TouchableOpacity activeOpacity={0.8} onPress={onPressAddress}>
        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order.address}</Text>
        </View>
      </TouchableOpacity>

      {/* Total Bill */}
      <View style={styles.totalContainer}>
        <View style={styles.Totalbillcontainer}>
          <Text style={styles.totalBill}>Total Bill</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.codText}>{order.paymentMethod}</Text>
          </View>
        </View>
        <Text style={styles.totalPrice}>₹{order.total}</Text>
      </View>
    </View>
  );


  
  const renderOrderCard = order => {
    const commonProps = {
      order,
      onPressAddress: () => navigation.navigate('OrderDetailsScreen', {order}),
    };

    switch (order.status) {
      case 'Pending':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Pending"
          />
        );

      case 'Ongoing':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Ongoing"
          />
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (orders.length === 0) {
      return (
        <View>
{!showToggleModal && <AdvertisementsCarousel />}
          <View style={styles.onlineSection}>
            <Image source={Ordersscreenimage} style={styles.emptyOrdersImage} />
            <Text
              style={[
                styles.onlineText,
                {color: isOn ? colors.onlineGreen : colors.danger},
              ]}>
              You are {isOn ? 'online' : 'offline'}.
            </Text>
            <Text style={styles.waitingText}>
              {isOn
                ? 'waiting for new orders'
                : 'switch on to start receiving orders'}
            </Text>
          </View>
        </View>
      );
    }
    return orders.map(order => renderOrderCard(order));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />

      {/* Header with Online Toggle */}
      <View style={styles.header}>
        <Image source={RestaurantLogo} style={styles.avatar} />
        <Text style={styles.restaurantName}>
          Bismillah Family Indian Restaurant
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleContainer,
            isOn ? styles.toggleOn : styles.toggleOff,
          ]}
          activeOpacity={0.8}
          onPress={() => setShowToggleModal(true)}>
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[
              styles.tabButton,
              selectedTab === tab.label && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.label)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.label && styles.tabTextActive,
              ]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderContent()}
      </ScrollView>

      {/* Toggle Confirmation Modal */}
      <Modal
        visible={showToggleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowToggleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isOn ? 'Go Offline?' : 'Go Online?'}
            </Text>
            <Text style={styles.modalMessage}>
              {isOn
                ? 'You will stop receiving new orders.'
                : 'You will start receiving orders.'}
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowToggleModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton2]}
                onPress={handleToggleConfirm}>
                <Text style={styles.confirmButton2Text}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background, paddingTop: 40},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: colors.background, marginBottom: 5},
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  restaurantName: {flex: 1, fontSize: 13, fontWeight: 'bold', color: colors.textDark},
  toggleContainer: {width: 64, height: 32, borderRadius: 16, justifyContent: 'center', padding: 4},
  toggleOn: {backgroundColor: '#00CE9C'},
  toggleOff: {backgroundColor: '#ccc'},
  circle: {width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background},

  tabContainer: {flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.background, elevation: 2, paddingVertical: 8, marginVertical: 7},
  tabButton: {paddingVertical: 11, justifyContent: 'center', alignItems: 'center', borderRadius: 5, marginVertical: 3, borderWidth: 1, borderColor: colors.border, width: '47%'},
  tabButtonActive: {backgroundColor: colors.primaryLight, borderColor: colors.primaryLight},
  tabText: {fontSize: 14, fontWeight: '700', color: colors.textLight},
  tabTextActive: {fontSize: 14, color: colors.textMuted, fontWeight: 'bold'},

  scrollViewContent: {paddingBottom: 10},
  onlineSection: {alignItems: 'center', marginTop: 30},
  onlineText: {fontSize: 16, fontWeight: '500', marginTop: 12, color: colors.onlineGreen},
  waitingText: {fontSize: 16, color: colors.textMuted, marginTop: 4},
  emptyOrdersImage: {width: 300, height: 200, resizeMode: 'contain'},

  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
  modalContainer: {width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center'},
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  modalMessage: {fontSize: 14, textAlign: 'center', marginBottom: 20},
  modalButtonRow: {flexDirection: 'row', justifyContent: 'space-between', width: '100%'},
  modalButton: {flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5},
  cancelButton: {backgroundColor: '#ddd'},
  cancelButtonText: {color: '#333', fontWeight: 'bold'},
  confirmButton2: {backgroundColor: colors.primarySemi},
  confirmButton2Text: {color: '#fff', fontWeight: 'bold'},

  // ✅ OrderCard Styles
  card: {backgroundColor: colors.cardBackground, padding: 12, borderRadius: 5, marginVertical: 12, elevation: 3, marginHorizontal: 15, borderWidth: 1, borderColor: colors.black7},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  orderId: {fontWeight: '500', fontSize: 14, color: colors.primary},
  dateTimeContainer: {flexDirection: 'row', gap: 10},
  orderTime: {fontSize: 14, color: colors.textMedium, fontWeight: '500'},
  statusBadge: {paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5, alignSelf: 'flex-start', marginBottom: 6},
  statusBadgeText: {fontSize: 12, fontWeight: '500', color: colors.textWhite},
  addressCard: {borderWidth: 0.8, borderColor: colors.borderLight, backgroundColor: colors.background, borderRadius: 6, padding: 10, marginVertical: 15},
  addressTitle: {fontSize: 13, fontWeight: '600', color: colors.textDark},
  addressText: {fontSize: 13, color: colors.textMedium, marginTop: 7},
  totalContainer: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8},
  Totalbillcontainer: {flexDirection: 'row', gap: 20},
  totalBill: {fontSize: 14, color: colors.textDark, fontWeight: '500'},
  paymentMethod: {borderRadius: 5, backgroundColor: colors.primaryLight, paddingHorizontal: 6, padding: 2},
  codText: {fontSize: 11, color: colors.primary, fontWeight: '500'},
  totalPrice: {fontSize: 14, fontWeight: 'bold', color: colors.totalPrice},
});
