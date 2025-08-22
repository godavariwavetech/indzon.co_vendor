import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../config/theme';

const transactions = [
  {
    id: '1',
    amount: -2200,
    description: 'Need to be approved by Quickee',
    status: 'Pending',
    date: '11,Mar 2025',
  },
  {
    id: '2',
    amount: -3400,
    description: 'Amount Transferred successfully',
    status: 'Transferred',
    date: '09,Mar 2025',
  },
  {
    id: '3',
    amount: 110,
    description: 'Order ID : #100021',
    status: null,
    date: '08,Mar 2025',
  },
  {
    id: '4',
    amount: -4000,
    description: 'Amount Transferred successfully',
    status: 'Transferred',
    date: '06,Mar 2025',
  },
  {
    id: '5',
    amount: -240,
    description: 'Rejected by Quickee',
    status: 'Rejected',
    date: '05,Mar 2025',
  },
];

export default function EarningsScreen() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Auto close after 3 seconds when success is shown
  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowWithdraw(false);
        setShowSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess]);

  // 🔹 Date Picker states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selecting, setSelecting] = useState('start');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const showDatePicker = type => {
    setSelecting(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = date => {
    if (selecting === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    hideDatePicker();
  };

  const formatDate = date => {
    if (!date) return '--';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  const renderTransaction = ({item}) => {
    const amountColor =
      item.amount >= 0 ? colors.earningsAmountPositive : colors.earningsAmountNegative;
    const statusColors = {
      Pending: colors.earningsPending,
      Transferred: colors.earningsTransferred,
      Rejected: colors.earningsRejected,
    };

    return (
      <View style={styles.transactionCard}>
        <View style={{flex: 1}}>
          <Text style={[styles.amount, {color: amountColor}]}>
            {item.amount >= 0
              ? `+ ₹${item.amount.toFixed(2)}`
              : `-₹${Math.abs(item.amount).toFixed(2)}`}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={{alignItems: 'flex-end'}}>
          {item.status && (
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: statusColors[item.status]},
              ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
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

        <Text style={styles.amountBig}>₹2200.00</Text>

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => {
            setShowWithdraw(true);
            setShowSuccess(false);
          }}>
          <Icon name="cash-outline" size={20} color={colors.textDark} />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range Picker */}
      <View style={styles.dateRow}>
        <Text style={styles.transactionHistoryText}>Transaction History:</Text>

        {/* Start Date */}
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => showDatePicker('start')}>
          <Icon name="calendar-outline" size={16} color={colors.textDark} />
          <Text style={styles.dateText}>
            {startDate ? formatDate(startDate) : 'Start Date'}
          </Text>
        </TouchableOpacity>

        {/* End Date */}
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => showDatePicker('end')}>
          <Icon name="calendar-outline" size={16} color={colors.textDark} />
          <Text style={styles.dateText}>
            {endDate ? formatDate(endDate) : 'End Date'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider2} />

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={{paddingBottom: 20}}
      />

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdraw}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdraw(false)}>
        <View style={styles.modalOverlay}>
          {showSuccess ? (
            // ✅ Success Card
            <View style={styles.successCard}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWithdraw(false)}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>

              <View style={styles.successCircle}>
                <Icon name="checkmark" size={40} color={colors.textWhite} />
              </View>

              <Text style={styles.successText}>
                “Your applied for Withdraw Request“
              </Text>

              <View style={styles.successDivider} />

              <TouchableOpacity
                style={styles.thanksWrapper}
                onPress={() => {
                  setShowWithdraw(false);
                  setShowSuccess(false);
                }}>
                <Text style={styles.successThanks}>Yahooo! Thanks</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ✅ Withdraw Form
            <View style={styles.withdrawCard}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowWithdraw(false)}>
                <Icon name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>

              <Text style={styles.cardTitle}>Withdraw</Text>

              <View style={styles.bankIconWrapper}>
                <Icon name="cash-outline" size={40} color={colors.primary} />
              </View>

              <Text style={styles.inputLabel}>Enter Amount</Text>
              <TextInput
                placeholder="₹0.00"
                keyboardType="numeric"
                style={styles.inputBox}
              />

              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => setShowSuccess(true)}>
                <Text style={styles.cardButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
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
    paddingTop: 50,
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

  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
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
  dateText: {fontSize: 12, marginLeft: 5},

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: colors.earningsCardBorder,
    shadowColor: colors.earningsShadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  amount: {fontSize: 15, fontWeight: '500'},
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

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.earningsModalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawCard: {
    width: 375,
    height: 311,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  cardTitle: {fontSize: 18, fontWeight: '600', marginBottom: 15},
  bankIconWrapper: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 50,
    padding: 15,
    marginBottom: 20,
  },
  inputLabel: {alignSelf: 'flex-start', marginBottom: 5, fontSize: 14},
  inputBox: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  cardButton: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonText: {color: colors.textWhite, fontSize: 16, fontWeight: '600'},

  successCard: {
    width: 300,
    height: 266,
    backgroundColor: colors.earningsSuccessBg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: 20,
  },
  successDivider: {
    height: 1,
    backgroundColor: colors.earningsSuccessDivider,
    width: '100%',
    marginVertical: 10,
  },
  successThanks: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  thanksWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
});
