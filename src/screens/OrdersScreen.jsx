import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  fetchCurrentOrders,
  fetchShopDetails,
  updateShopStatus,
} from '../redux/reducers/auth';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from '../components/NoInternetScreen';

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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {colors} from '../config/theme';
import {Ordersscreenimage, RestaurantLogo} from '../assets/index';
import {useFocusEffect} from '@react-navigation/native';

export default function OrdersScreen({navigation}) {
  const dispatch = useDispatch();
  const {pendingOrders, OrdersInProcess, loading, userId, shopDetails} =
    useSelector(state => state.Auth);

  const [isOn, setIsOn] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Pending');
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await dispatch(fetchCurrentOrders(userId));
      if (!shopDetails) {
        const val = await dispatch(fetchShopDetails(userId));
        console.log(val,">>>>>>>>>>>VALUEEEE");
      
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, [userId, dispatch, shopDetails]);

  const fetchOrders = async () =>{
    const resp = await dispatch(fetchCurrentOrders(userId));
    console.log(resp,">>>>>>>>>>>>>RESPONSSSS");
  }

  // Refetch orders when internet comes back
  useEffect(() => {
    if (isConnected && userId) {
      fetchOrders()
      dispatch(fetchCurrentOrders(userId));
      if (!shopDetails) {
        dispatch(fetchShopDetails(userId));
      }
    }
  }, [isConnected, userId, dispatch, shopDetails]);

  // ✅ Listen for internet changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch orders and shop details

  const fetchOrdersAndDetails = useCallback(() => {
    if (!userId) return;
    dispatch(fetchCurrentOrders(userId));
    if (!shopDetails) dispatch(fetchShopDetails(userId));
  }, [userId, dispatch, shopDetails]);

  useFocusEffect(fetchOrdersAndDetails);
  // Toggle shop status
  useEffect(() => {
    if (shopDetails?.shop_active_status !== undefined) {
      setIsOn(shopDetails.shop_active_status === 1);
    }
  }, [shopDetails]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOn ? 30 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOn, translateX]);

  const handleToggleConfirm = () => {
    const newStatus = isOn ? 0 : 1;
    dispatch(updateShopStatus({shop_id: userId, shop_active_status: newStatus}));
    setIsOn(!isOn);
    setShowToggleModal(false);
  };

  const orders = selectedTab === 'Pending' ? pendingOrders : OrdersInProcess;

  const tabs = [
    {label: 'Pending', count: pendingOrders.length},
    {label: 'Orders In Process', count: OrdersInProcess.length},
  ];

  // ✅ Inline OrderCard
  const OrderCard = ({order, statusColor, statusLabel, onPressAddress}) => (
    <TouchableOpacity activeOpacity={0.5} onPress={onPressAddress}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>ID-{order.order_id}</Text>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.orderTime}>{order.order_date}</Text>
            <Text style={styles.orderTime}>{order.order_time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order.delivery_address}</Text>
        </View>
        <View style={styles.totalContainer}>
          <View style={styles.Totalbillcontainer}>
            <Text style={styles.totalBill}>Total Bill</Text>
            <View style={styles.paymentMethod}>
              <Text style={styles.codText}>{order.payment_type}</Text>
            </View>
          </View>
          <Text style={styles.totalPrice}>₹{order.total_amount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderCard = order => {
    const commonProps = {order, onPressAddress: () => navigation.navigate('OrderDetailsScreen', {order})};
    switch (order.order_status) {
      case 0: return <OrderCard key={order.id} {...commonProps} statusColor={colors.primary} statusLabel="Pending" />;
      case 1: return <OrderCard key={order.id} {...commonProps} statusColor={colors.primary} statusLabel="Accepted" />;
      case 8: return <OrderCard key={order.id} {...commonProps} statusColor={colors.primary} statusLabel="Ongoing" />;
      default: return <OrderCard key={order.id} {...commonProps} statusColor={colors.primarySemi} statusLabel={`Status ${order.order_status}`} />;
    }
  };

  const renderContent = () => {
    if (orders.length === 0) {
      if (!isConnected) {
        // ✅ Show NoInternetScreen if offline
        return <NoInternetScreen onRetry={fetchOrdersAndDetails} />;
      }

      // Otherwise show empty orders message
      return (
        <View style={styles.onlineSection}>
          <Image source={Ordersscreenimage} style={styles.emptyOrdersImage} />
          <Text style={[styles.onlineText, {color: isOn ? colors.onlineGreen : colors.danger}]}>
            You are {isOn ? 'online' : 'offline'}.
          </Text>
          <Text style={styles.waitingText}>
            {isOn ? 'waiting for new orders' : 'switch on to start receiving orders'}
          </Text>
        </View>
      );
    }

    return orders.map(order => renderOrderCard(order));
  };

  // ✅ Show NoInternetScreen if offline


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />
      <View style={styles.header}>
        <Image source={shopDetails?.image ? {uri: shopDetails.image} : RestaurantLogo} style={styles.avatar} />
        <Text style={styles.restaurantName}>{shopDetails?.name || 'Restaurant Name'}</Text>
        <TouchableOpacity style={[styles.toggleContainer, isOn ? styles.toggleOn : styles.toggleOff]} onPress={() => setShowToggleModal(true)}>
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </TouchableOpacity>
      </View>
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.label} style={[styles.tabButton, selectedTab === tab.label && styles.tabButtonActive]} onPress={() => setSelectedTab(tab.label)}>
            <Text style={[styles.tabText, selectedTab === tab.label && styles.tabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>




      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading orders...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollViewContent, {flexGrow: 1}]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {renderContent()}
        </ScrollView>
      )}

      <Modal visible={showToggleModal} transparent animationType="fade" onRequestClose={() => setShowToggleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{isOn ? 'Go Offline?' : 'Go Online?'}</Text>
            <Text style={styles.modalMessage}>{isOn ? 'You will stop receiving new orders.' : 'You will start receiving orders.'}</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowToggleModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton2]} onPress={handleToggleConfirm}>
                <Text style={styles.confirmButton2Text}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ Keep all existing styles, no changes needed for NoInternetScreen integration

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background, paddingTop: 40},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: colors.background,
    marginBottom: 5,
  },
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  restaurantName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  toggleContainer: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 4,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  toggleOn: {backgroundColor: 'green'},
  toggleOff: {backgroundColor: '#ccc'},

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    elevation: 2,
    paddingVertical: 8,
    marginVertical: 7,
  },
  tabButton: {
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  tabText: {fontSize: 14, fontWeight: '700', color: colors.textLight},
  tabTextActive: {fontSize: 14, color: colors.textWhite, fontWeight: 'bold'},

  scrollViewContent: {paddingBottom: 10},
  onlineSection: {alignItems: 'center', marginTop: 30},
  onlineText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    color: colors.onlineGreen,
  },
  waitingText: {fontSize: 16, color: colors.textMuted, marginTop: 4},
  emptyOrdersImage: {width: 300, height: 200, resizeMode: 'contain'},

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
  confirmButton2: {backgroundColor: colors.primary},
  confirmButton2Text: {color: '#fff', fontWeight: 'bold'},

  // ✅ OrderCard Styles
  card: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    marginHorizontal: 15,
    // borderWidth: 2,
    borderColor: colors.black7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4, // 4px down
    },
    shadowOpacity: 0.25, // 40 hex = 25% opacity
    shadowRadius: 4, // blur radius
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {fontWeight: '500', fontSize: 14, color: colors.primary},
  dateTimeContainer: {flexDirection: 'row', gap: 10},
  orderTime: {fontSize: 14, color: colors.textMedium, fontWeight: '500'},
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgeText: {fontSize: 12, fontWeight: '500', color: colors.textWhite},

  addressCard: {
    borderWidth: 0.8,
    borderColor: colors.black8,
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    marginVertical: 15,
  },
  addressTitle: {fontSize: 13, fontWeight: '600', color: colors.textDark},
  addressText: {fontSize: 13, color: colors.textMedium, marginTop: 7},
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  Totalbillcontainer: {flexDirection: 'row', gap: 20},
  totalBill: {fontSize: 14, color: colors.textDark, fontWeight: '500'},
  paymentMethod: {
    borderRadius: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    padding: 2,
  },
  codText: {fontSize: 11, color: colors.textWhite, fontWeight: '500'},
  totalPrice: {fontSize: 14, fontWeight: 'bold', color: colors.totalPrice},
loaderContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 20,
},
loaderText: {
  marginTop: 10,
  fontSize: 16,
  color: colors.textSecondary || '#555',
},

});
