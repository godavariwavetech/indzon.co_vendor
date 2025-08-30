import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {colors} from '../config/theme';
import WithdrawModal from '../components/WithdrawModal';


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
      item.amount >= 0
        ? colors.earningsAmountPositive
        : colors.earningsAmountNegative;
    const statusColors = {
      Pending: colors.earningsPending,
      Transferred: colors.earningsTransferred,
      Rejected: colors.earningsRejected,
    };

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <Text style={[styles.amount, {color: amountColor}]}>
            {item.amount >= 0
              ? `+ ₹${item.amount.toFixed(2)}`
              : `-₹${Math.abs(item.amount).toFixed(2)}`}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.transactionRight}>
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

      <View style={styles.dateRow}>
        <Text style={styles.transactionHistoryText}>Transaction History:</Text>

        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => showDatePicker('start')}>
          <Icon name="calendar-outline" size={16} color={colors.textDark} />
          <Text style={styles.dateText}>
            {startDate ? formatDate(startDate) : 'Start Date'}
          </Text>
        </TouchableOpacity>

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

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
      />

<WithdrawModal
  visible={showWithdraw}
  onClose={() => {
    setShowWithdraw(false);
    setShowSuccess(false);
  }}
  showSuccess={showSuccess}
  setShowSuccess={setShowSuccess}
/>




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
  transactionLeft: {flex: 1},
  transactionRight: {alignItems: 'flex-end'},
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

  listContent: {paddingBottom: 20},

  
});
