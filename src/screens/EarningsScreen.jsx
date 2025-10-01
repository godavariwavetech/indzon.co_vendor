import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchShopPayments, fetchPaymentHistory} from '../redux/reducers/auth';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {colors} from '../config/theme';

export default function EarningsScreen() {
  const dispatch = useDispatch();
  const {userId, shopPayments, paymentHistory} = useSelector(
    state => state.Auth,
  );

  const formatDate = date => {
    if (!date) return '--';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const today = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(today.getDate() - 90);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);

  // fetch shop payments once
  useEffect(() => {
    if (userId) {
      dispatch(fetchShopPayments(userId));
    }
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

  const applyDateFilter = () => {
    if (userId && startDate && endDate) {
      const payload = {
        f_date: formatDate(startDate),
        t_date: formatDate(endDate),
        userId,
      };
      console.log('Fetching payment history with payload:', payload);
      dispatch(fetchPaymentHistory(payload));
    }
  };

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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
      (shopPayments?.item_amount ?? 0) -
      (shopPayments?.admin_service_fee ?? 0) -
      (shopPayments?.vendor_coupon_amount ?? 0)
    ).toFixed(2)}
  </Text>
</View>

     <TouchableOpacity
  style={styles.withdrawBtn}
  onPress={() => setShowInfoModal(true)} // 🔹 Open Info Modal
>
  <Icon name="cash-outline" size={20} color={colors.textDark} />
  <Text style={styles.withdrawText}>Payout Cycle</Text>
</TouchableOpacity>
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

          <TouchableOpacity style={styles.applyBtn} onPress={applyDateFilter}>
          <Text style={styles.applyText}>Apply</Text>
          <Icon
            name="checkmark-done-outline"
            size={18}
            color={colors.reportsDownloadText}
          />
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider2} />

      {/* Transaction list */}
      <FlatList
        data={paymentHistory}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTransaction(item);
              setShowTransactionModal(true);
            }}>
            <View style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <Text style={styles.amount}>₹{item.total_payment_amount}</Text>
                <Text style={styles.description}>
                  Transaction ID: {item.payment_transaction_id || '--'}
                </Text>
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

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
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
                ₹{shopPayments?.item_amount ?? 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Item Amount GST (B)</Text>
              <Text style={styles.value}>
                ₹{shopPayments?.item_amount_gst ?? 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Service Fee (C)</Text>
              <Text style={styles.value}>
                ₹{shopPayments?.admin_service_fee ?? 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Coupon (D)</Text>
              <Text style={styles.value}>
                ₹{shopPayments?.admin_coupon_amount ?? 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vendor Coupon (E)</Text>
              <Text style={styles.value}>
                ₹{shopPayments?.vendor_coupon_amount ?? 0}
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
  <Text style={[styles.label, {fontWeight: 'bold'}]}>Verify OTP:</Text>
  <Text style={styles.otpCode}>{shopPayments?.vendor_payment_otp ?? '--'}</Text>
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
              <Text style={styles.label}>Payment Date</Text>
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
              <Text style={styles.label}>Total Amount (A)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.total_payment_amount || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>GST Charges (B)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.gst_charges_C || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Service Fee (C)</Text>
              <Text style={styles.value}>
                ₹{selectedTransaction?.admin_share_B || 0}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Admin Coupon (D)</Text>
              <Text style={styles.value}>₹0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vendor Coupon (E)</Text>
              <Text style={styles.value}>₹0</Text>
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
  dateText: {fontSize: 12, },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 0.85,
    borderColor:"#9a9898ff",
    // borderColor: colors.earningsCardBorder,

    elevation:0
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

  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 12, color:colors.primary},
  modalItem: {fontSize: 14, marginBottom: 8, color: '#333'},
  modalCloseBtn: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: colors.earningsWithdrawBtnBg,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalCloseText: {fontSize: 14, fontWeight: '500', color: colors.textDark},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems:"center"
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight:5
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

});
