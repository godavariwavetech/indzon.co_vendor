import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {fetchOrderDetails, updateOrderStatus} from './../redux/reducers/auth';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../config/theme';

export default function OrderDetailsScreen({route}) {
  const {order} = route.params;
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.order_status); // numeric status
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // ✅ Parse rider info if available
  let riderInfo = null;
  if (order.order_status === 8 && order.delivery_boy_array) {
    try {
      const parsed = JSON.parse(order.delivery_boy_array);
      if (Array.isArray(parsed) && parsed.length > 0) {
        riderInfo = parsed[0];
      }
    } catch (e) {
      console.warn('Failed to parse delivery_boy_array:', e);
    }
  }

  const statusSteps = ['Placed', 'Accepted', 'Ongoing', 'Delivered'];
  const statusMap = {0: 'Placed', 1: 'Accepted', 8: 'Ongoing', 3: 'Delivered'};

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const resultAction = await dispatch(fetchOrderDetails(order.id));
        if (fetchOrderDetails.fulfilled.match(resultAction)) {
          const fetchedItems = resultAction.payload;

          // 🔹 Grouping items by name and price to handle duplicates from API
          const grouped = fetchedItems.reduce((acc, item) => {
            if (!item.name) return acc;
            
            const key = `${item.name.trim().toLowerCase()}-${Number(item.price)}`;
            
            if (!acc[key]) {
              acc[key] = {...item};
              acc[key].quantity = Number(item.quantity) || 0;
              acc[key].item_total_amount = Number(item.item_total_amount) || 0;
            } else {
              acc[key].quantity += (Number(item.quantity) || 0);
              acc[key].item_total_amount += (Number(item.item_total_amount) || 0);
            }
            return acc;
          }, {});

          setItems(Object.values(grouped));
        }
      } catch (err) {
        console.error('Error fetching order items', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, [order.id, dispatch]);

  const handleRejectConfirm = async () => {
    try {
      const resultAction = await dispatch(
        updateOrderStatus({orderId: order.id, orderStatus: '5'}),
      );
      if (updateOrderStatus.fulfilled.match(resultAction)) {
        setOrderStatus(5);
      }
    } finally {
      setShowRejectModal(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const resultAction = await dispatch(
        updateOrderStatus({orderId: order.id, orderStatus: '1'}),
      );
      if (updateOrderStatus.fulfilled.match(resultAction)) {
        setOrderStatus(1);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  /* 
    ✅ CALCULATION LOGIC:
  */
  const totalItemsCount = Number(order.item_count) || (items.length > 0 ? items[0].item_count : 0);
  const finalGrandTotal = Number(order.grand_total) || 0;
  const totalSavings = Number(order.total_saving_amount) || 0;
  const deliveryCharges = Number(order.delivery_charges) || 0;
  
  // Checking both order object and items array for coupon safely
  const totalCoupon = Number(order.coupon_amount) || (items.length > 0 ? Number(items[0].coupon_amount) || 0 : 0);
  
  // GST is typically inside the item array based on your previous code
  const totalGst = items.length > 0 ? Number(items[0].total_item_gst_amount) || 0 : 0;
  
  // Base MRP based on fetched items
  const totalMrp = items.reduce(
    (acc, item) => acc + (Number(item.price) * Number(item.quantity) || 0),
    0,
  );

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

      <ScrollView style={styles.contentContainerStyle}>
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID - {order.order_id}</Text>
          <Text style={styles.orderTime}>
            {order.order_date} {order.order_time}
          </Text>
          <View style={styles.divider} />

          {/* Status Tracker */}
          <View style={styles.statusRow}>
            {statusSteps.map((step, index) => {
              const currentStepIndex = statusSteps.indexOf(statusMap[orderStatus]);
              const isActive = index <= currentStepIndex;
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
                  {index < statusSteps.length - 1 && (
                    <View style={styles.statusLine} />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.divider2} />

          {loadingItems ? (
            <Text style={{textAlign: 'center', marginVertical: 10}}>
              Loading items...
            </Text>
          ) : (
            items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <Image source={{uri: item.image}} style={styles.logo} />
                {item.filter_one && (
                  <MaterialCommunityIcons
                    name="square-circle"
                    size={16}
                    color={item.isVeg ? 'green' : 'red'}
                    style={{marginRight: 6}}
                  />
                )}
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))
          )}

          <View style={styles.divider} />

          {/* ✅ UPDATED: Footer Row now shows Item Total instead of Grand Total */}
          <View style={styles.footerRow}>
            <View style={styles.billLeft}>
              <Text style={styles.totalBillLabel}>Item Total</Text>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentText}>{order.payment_type}</Text>
              </View>
            </View>
            <Text style={styles.totalPrice}>
              ₹{loadingItems ? '...' : totalMrp.toFixed(2)}
            </Text>
          </View>

          {/* Action buttons */}
          {order.order_status === 0 && orderStatus === 0 && (
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
          )}
        </View>

        {/* Cooking Request */}
        {(orderStatus === 0 || orderStatus === 1) && order.order_instructions && (
          <View style={styles.requestCard}>
            <View style={styles.requestIconBox}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={22}
                color="#D84315"
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.requestTitle}>Cooking Request</Text>
              <Text style={styles.requestMessage}>
                {order.order_instructions}
              </Text>
            </View>
          </View>
        )}

        {/* Rider Info */}
        {orderStatus === 8 && riderInfo && (
          <View style={styles.deliveryCard}>
            <View style={{flex: 1}}>
              <Text style={styles.deliveryHeading}>Rider Details</Text>
              <Text style={styles.deliveryText}>
                {riderInfo.delivery_boy_name} is on the way
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() =>
                Linking.openURL(`tel:${riderInfo.delivery_boy_mobile_number}`)
              }>
              <Icon name="call" size={25} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Details Card */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Details</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total Items</Text>
            <Text style={styles.paymentValue}>
              {totalItemsCount}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Item Total MRP</Text>
            <Text style={styles.paymentValue}>
              ₹{loadingItems ? '...' : totalMrp.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total GST</Text>
            <Text style={styles.paymentValue}>
              ₹{loadingItems ? '...' : totalGst.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Delivery Charges</Text>
            <Text style={styles.paymentValue}>
              ₹{deliveryCharges.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Coupon Applied</Text>
            <Text style={[styles.paymentValue, {color: totalCoupon > 0 ? '#0F9D58' : '#000'}]}>
              {totalCoupon > 0 ? `- ₹${totalCoupon.toFixed(2)}` : '₹0.00'}
            </Text>
          </View>

          {totalSavings > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Savings</Text>
              <Text style={[styles.paymentValue, {color: '#0F9D58', fontWeight: 'bold'}]}>
                ₹{totalSavings.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.paymentRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{finalGrandTotal.toFixed(2)}
            </Text>
          </View>
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

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    position: 'relative',
  },
  statusItem: {alignItems: 'center', flex: 1, position: 'relative'},
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {fontSize: 12, fontWeight: '600', textAlign: 'center'},
  statusLine: {
    position: 'absolute',
    top: 14,
    right: -25,
    height: 2,
    width: 50,
    backgroundColor: '#ccc',
    zIndex: -1,
  },

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
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  paymentText: {fontSize: 12, fontWeight: '500', color: colors.textWhite},
  totalPrice: {fontSize: 16, fontWeight: 'bold', color: '#000'},

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

  requestCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0', 
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFB74D',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestIconBox: {
    marginRight: 12,
    marginTop: 2,
    padding: 6,
    backgroundColor: '#FFE0B2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestTitle: {
    color: '#D84315', 
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 15,
  },
  requestMessage: {
    color: '#3E2723',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
    borderColor:"#00000040",
    borderWidth:0.6,
    paddingVertical:18
  },
  deliveryText: {fontWeight: '600', fontSize: 14, color: '#000'},
  callButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },

  paymentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    paddingVertical: 20,
    borderRadius: 8,
    elevation: 3,
    marginTop: 15,
    marginBottom: 30,
    borderColor: '#00000020',
    borderWidth: 0.5,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F9D58',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  grandTotalRow: {
    marginTop: 8,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});