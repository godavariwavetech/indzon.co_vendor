import {DEMO_MODE} from '../demo/config';
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchShopPayments, fetchPaymentHistory, fetchApplicationCommon} from '../redux/reducers/auth';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from '../components/NoInternetScreen';
import {ActivityIndicator} from 'react-native';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {colors} from '../config/theme';

export default function EarningsScreen() {
  const dispatch = useDispatch();
  const {userId, shopPayments, paymentHistory, loading, applicationCommon} = useSelector(
    state => state.Auth,
  );
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Listen to internet changes
  useEffect(() => {
    if (DEMO_MODE) return;
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(DEMO_MODE || state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = date => {
    if (!date) return '--';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const today = new Date();
  const defaultStart = new Date();
  // defaultStart.setDate(today.getDate() - 90);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);

  // fetch shop payments once
  useEffect(() => {
    if (userId) {
      dispatch(fetchShopPayments(userId));
    }
    dispatch(fetchApplicationCommon());
  }, [userId, dispatch]);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selecting, setSelecting] = useState('start');

  const showDatePicker = type => {
    setSelecting(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = date => {
    if (selecting === 'start') {
      setStartDate(new Date(date));
    } else {
      setEndDate(new Date(date));
    }
    hideDatePicker();
  };

  // Auto-fetch transaction history whenever dates change
  useEffect(() => {
    if (userId && startDate && endDate) {
      const payload = {
        f_date: formatDate(startDate),
        t_date: formatDate(endDate),
        userId,
      };
      // console.log('Fetching payment history with payload:', payload);
      dispatch(fetchPaymentHistory(payload));
    }
  }, [startDate, endDate, userId, dispatch]);

  const handleRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);

    // Re-fetch data
    await dispatch(fetchShopPayments(userId));
    await dispatch(
      fetchPaymentHistory({
        f_date: formatDate(startDate),
        t_date: formatDate(endDate),
        userId,
      }),
    );

    setRefreshing(false);
  };

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleContactAdmin = () => {
    if (DEMO_MODE) { alert('Support is available using the contact details provided.'); return; }
    const phoneNumber = applicationCommon?.contact_number; // Replace with actual admin number from config or API if available
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
        alert("Admin contact number not available.");
    }
  };

  // Reverse payment history to show latest first
  const sortedPaymentHistory = React.useMemo(() => {
    return [...paymentHistory].reverse();
  }, [paymentHistory]);


  console.log(paymentHistory,">>>>>>>>>>>>>>>>>>.paymentHistory",shopPayments);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Withdrawable amount</Text>
        <Text style={styles.note}>
          Note : Your restaurant's earnings will be paid out after a withdrawal
          request, which typically takes 1-2 days to process.
        </Text>
        <Text style={styles.note}>
          • You can request withdraw only 1 time in a day.
        </Text>
        <View style={styles.divider} />

        {/* Amount + Info icon row */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.amountBig}>
            ₹
            {(
              (shopPayments?.item_amount ?? 0)+
              (shopPayments?.item_amount_gst ?? 0)-
              (shopPayments?.admin_service_fee ?? 0) +
              (shopPayments?.admin_coupon_amount ?? 0) -
              (shopPayments?.vendor_coupon_amount ?? 0)
            ).toFixed(2)}
          </Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.withdrawBtn, styles.actionButton]}
            onPress={() => setShowInfoModal(true)} // 🔹 Open Info Modal
          >
            <Icon name="cash-outline" size={20} color={colors.textDark} />
            <Text style={styles.withdrawText}>Payout Cycle</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity
            style={[styles.withdrawBtn, styles.actionButton]}
            onPress={() => setShowWithdrawModal(true)} // 🔹 Open Withdraw Modal
          >
            <Icon name="card-outline" size={20} color={colors.textDark} />
            <Text style={styles.withdrawText}>Withdraw</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Date Range */}
      <View style={styles.headerSection}>
        <Text style={styles.historyTitle}>Transaction History</Text>

        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => showDatePicker('start')}>
            <Text style={styles.dateText}>Start: {formatDate(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => showDatePicker('end')}>
            <Text style={styles.dateText}>End: {formatDate(endDate)}</Text>
          </TouchableOpacity>


        </View>
      </View>

      <View style={styles.divider2} />

      {/* Transaction list */}
      {!isConnected ? (
        // Case 1: No internet
        <NoInternetScreen
          onRetry={() => {
            if (userId) {
              dispatch(fetchShopPayments(userId));
              dispatch(
                fetchPaymentHistory({
                  f_date: formatDate(startDate),
                  t_date: formatDate(endDate),
                  userId,
                }),
              );
            }
          }}
        />
      ) : (refreshing || loading) && paymentHistory.length === 0 ? (
        // Case 2: Full-screen loader during refresh
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.reportsDownloadText} />
          <Text style={{marginTop: 8, color: '#888'}}>Loading...</Text>
        </View>
      ) : paymentHistory.length === 0 ? (
        // Case 3: No transactions
        <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
          No transactions found for the selected date range
        </Text>
      ) : (
        // Case 4: Transactions available
   <FlatList
          data={sortedPaymentHistory}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            refreshing ? (
              <ActivityIndicator
                size="small"
                color={colors.reportsDownloadText}
                style={{marginVertical: 10}}
              />
            ) : null
          }
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedTransaction(item);
                setShowTransactionModal(true);
              }}>
              <View style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.amount}>
                    ₹{item.total_payment_amount}
                  </Text>
                  
                  {/* Added: Mode of Payment */}
                  <Text style={styles.description}>
                    Mode: {item.payment_method || '--'}
                  </Text>

                  {/* Added: Payment Period */}
                  <Text style={styles.description}>
                    Period: {item.payment_dates || '--'}
                  </Text>
                  
                  {/* Conditional rendering: Show Transaction ID only if NOT Cash */}
                  {item.payment_method !== 'Cash' && (
                    <Text style={styles.description}>
                      Txn ID: {item.payment_transaction_id || '--'}
                    </Text>
                  )}
                  
                </View>

                <View style={styles.transactionRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: colors.earningsTransferred},
                    ]}>
                    <Text style={styles.statusText}>
                      {item.status || 'Completed'}
                    </Text>
                  </View>
                  <Text style={styles.date}>{item.settlement_date_time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selecting === 'start' ? startDate : endDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Payout cycle</Text>

            <View
              style={[
                styles.row,
                {
                  borderTopWidth: 1,
                  borderColor: '#ddd',
                  marginTop: 8,
                  paddingTop: 8,
                },
              ]}></View>

            {/* Table-like breakdown */}
            <View style={styles.row}>
              <Text style={styles.label}>Total Orders</Text>
              <Text style={styles.value}>
                {shopPayments?.total_orders ?? '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Orders Amount (A)</Text>
              <Text style={styles.value}>
                ₹{Number(shopPayments?.item_amount ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Item Amount GST (B)</Text>
              <Text style={styles.value}>
                ₹{Number(shopPayments?.item_amount_gst ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Service Fee (C)</Text>
              <Text style={styles.value}>
                ₹{Number(shopPayments?.admin_service_fee ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Coupon (D)</Text>
              <Text style={styles.value}>
                ₹{Number(shopPayments?.admin_coupon_amount ?? 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vendor Coupon (E)</Text>
              <Text style={styles.value}>
                ₹{Number(shopPayments?.vendor_coupon_amount ?? 0).toFixed(2)}
              </Text>
            </View>

            <View
              style={[
                styles.row,
                {
                  borderTopWidth: 1,
                  borderColor: '#ddd',
                  marginTop: 18,
                  paddingTop: 18,
                },
              ]}>
              <View style={styles.row}>
                <Text style={[styles.label, {fontWeight: 'bold'}]}>
                  Verify OTP:
                </Text>
                <View style={{flex: 1, alignItems: 'flex-end'}}>
                  <Text style={styles.otpCode}>
                    {shopPayments?.vendor_payment_otp ?? '--'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowInfoModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        visible={showTransactionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransactionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Transaction Details</Text>

            <View
              style={[
                styles.row,
                {
                  borderTopWidth: 1,
                  borderColor: '#ddd',
                  marginTop: 8,
                  paddingTop: 8,
                },
              ]}
            />
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>
                {selectedTransaction?.shop_phone_number || '--'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>payment_method</Text>
              <Text style={styles.value}>
                {selectedTransaction?.payment_method || '--'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Dates:</Text>
              <Text style={styles.value}>
                {selectedTransaction?.payment_dates || '--'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Settlement Date</Text>
              <Text style={styles.value}>
                {selectedTransaction?.settlement_date_time || '--'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Orders</Text>
              <Text style={styles.value}>
                {selectedTransaction?.total_orders || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Amount(A)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.item_amount || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Paid (B)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.total_payment_amount || 0}
              </Text>
            </View>
            {/* <View style={styles.row}>
              <Text style={styles.label}>GST Charges (B)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.item_amount_gst || 0}
              </Text>
            </View> */}
            <View style={styles.row}>
              <Text style={styles.label}>Admin Service Fee (C)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.admin_service_fee || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Coupon (D)</Text>
              <Text style={styles.value}>₹{selectedTransaction?.admin_coupon_amount || 0}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vendor Coupon (E)</Text>
              <Text style={styles.value}>₹{selectedTransaction?.vendor_coupon_amount || 0}</Text>
            </View>

            <View
              style={[
                styles.row,
                {
                  borderTopWidth: 1,
                  borderColor: '#ddd',
                  marginTop: 18,
                  paddingTop: 18,
                },
              ]}></View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTransactionModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, {paddingVertical: 20}]}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowWithdrawModal(false)}>
              <Icon name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, {textAlign: 'center'}]}>Withdraw Request</Text>
            
            <Text style={{textAlign: 'center', marginBottom: 20, color: '#333'}}>
              To initiate a withdrawal, please contact the admin.
            </Text>

             <TouchableOpacity
              style={[styles.withdrawBtn, {marginTop: 0, paddingHorizontal: 40, alignSelf:'center'}]}
              onPress={handleContactAdmin}>
              <Icon name="call-outline" size={20} color={colors.textDark} />
              <Text style={styles.withdrawText}>Contact Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},

  header: {
    backgroundColor: colors.earningsHeaderBg,
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 40,
  },
  headerTitle: {color: colors.textWhite, fontSize: 22, fontWeight: '500'},
  note: {
    color: colors.textWhite,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  amountBig: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.earningsWithdrawBtnBg,
    paddingHorizontal: 100,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  withdrawText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },

  transactionHistoryText: {fontSize: 14, fontWeight: '500'},
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dateText: {fontSize: 12},

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 0.85,
    borderColor: '#9a9898ff',
    // borderColor: colors.earningsCardBorder,

    elevation: 0,
  },
  transactionLeft: {flex: 1},
  transactionRight: {alignItems: 'flex-end'},
  amount: {fontSize: 15, fontWeight: '500', color: colors.success},
  description: {fontSize: 12, color: colors.earningsTextMuted, marginTop: 3},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 5,
  },
  statusText: {fontSize: 12, color: colors.textWhite, fontWeight: 'bold'},
  date: {fontSize: 11, color: colors.earningsTextMuted},

  divider: {
    marginVertical: 18,
    borderWidth: 0.75,
    borderColor: colors.earningsDividerWhite,
    width: 325,
    borderStyle: 'dashed',
  },
  divider2: {
    height: 1,
    backgroundColor: colors.earningsDividerBlack,
    marginVertical: 12,
    marginHorizontal: 20,
  },

  listContent: {paddingBottom: 20},

  // Info Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    paddingVertical: 60,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.primary,
  },
  modalItem: {fontSize: 14, marginBottom: 8, color: '#333'},
  modalCloseBtn: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalCloseText: {fontSize: 14, fontWeight: '500', color: colors.textWhite},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerSection: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    alignSelf: 'center',
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateBtn: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },

  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  applyText: {
    color: colors.reportsDownloadText,
    marginRight: 5,
    fontSize: 13,
  },
  otpCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textWhite, // red highlight (or use colors.primary)
    backgroundColor: colors.primary, // light background highlight
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 2, // spacing between digits
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 15,
  },
  actionButton: {
    marginTop: 0,
    paddingHorizontal: 10, 
    flex: 1, 
    marginHorizontal: 5, 
    justifyContent: 'center'
  },
});
