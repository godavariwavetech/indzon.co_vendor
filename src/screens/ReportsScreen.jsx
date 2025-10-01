import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {colors} from '../config/theme';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDashboardOrders} from '../redux/reducers/auth';

export default function ReportsScreen() {
  const dispatch = useDispatch();
  const {userId, dashboardOrders, loading} = useSelector(state => state.Auth);

  // ===================== Helpers =====================
  const formatAPIDate = date => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const formatDisplayDate = date => {
    if (!date) return '--';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  const statusMap = {
    0: 'Placed',
    1: 'Accepted',
    2: 'Ongoing',
    3: 'Delivered',
    5: 'Rejected',
    8: 'Cancelled',
  };

  // ===================== State =====================
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const [startDate, setStartDate] = useState(ninetyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selecting, setSelecting] = useState('start');

  // ===================== Fetch Orders =====================
  const fetchOrders = useCallback(() => {
    if (!userId) return;
    const f_date = formatAPIDate(startDate);
    const t_date = formatAPIDate(endDate);
    dispatch(fetchDashboardOrders({f_date, t_date, userId}));
  }, [startDate, endDate, userId, dispatch]);

  useEffect(() => {
    if (userId) fetchOrders();
  }, [userId, fetchOrders]);

  // ===================== Date Picker =====================
  const showDatePicker = type => {
    setSelecting(type);
    setDatePickerVisible(true);
  };
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirm = date => {
    selecting === 'start' ? setStartDate(date) : setEndDate(date);
    hideDatePicker();
  };

  // ===================== Render Order =====================
  const renderOrder = ({item}) => (
    <View style={styles.orderCardContainer}>
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderCardId} numberOfLines={1}>
          ID-{item.order_id}
        </Text>
        <View style={styles.rightHeaderBox}>
          <Text style={styles.orderCardTime}>
            {new Date(item.order_date_time).toLocaleDateString()} |{' '}
            {item.order_time}
          </Text>
          <View style={styles.orderCardStatusBox}>
            {item.order_rating > 0 && (
              <Text style={styles.orderCardRating}>{item.order_rating} ⭐</Text>
            )}
            <Text
              style={[
                styles.orderCardStatus,
                item.order_status === 3
                  ? styles.delivered
                  : item.order_status === 8
                  ? styles.cancelled
                  : item.order_status === 5
                  ? styles.rejected
                  : styles.otherStatus,
              ]}>
              {statusMap[item.order_status] || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{item.delivery_address}</Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalBill}>Total Bill</Text>
        <Text style={styles.totalPrice}>₹{item.grand_total}</Text>
      </View>
    </View>
  );

  // ===================== JSX =====================
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Order History</Text>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => showDatePicker('start')}>
          <Icon
            name="calendar-outline"
            size={18}
            color={colors.reportsTopTitle}
          />
          <Text style={styles.dateText}>{formatDisplayDate(startDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePicker}
          onPress={() => showDatePicker('end')}>
          <Icon
            name="calendar-outline"
            size={18}
            color={colors.reportsTopTitle}
          />
          <Text style={styles.dateText}>{formatDisplayDate(endDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadBtn} onPress={fetchOrders}>
          <Text style={styles.downloadText}>Apply</Text>
          <Icon
            name="checkmark-done-outline"
            size={18}
            color={colors.reportsDownloadText}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={[...dashboardOrders].reverse()}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  container: {
    flex: 1,
    backgroundColor: colors.reportsContainerBg,
    padding: 13,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  topTitle: {fontSize: 18, fontWeight: '600', color: colors.reportsTopTitle},

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderWidth: 0.75,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: colors.reportsFilterBorder,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.reportsDateBorder,
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 40,
    marginRight: 8,
  },
  dateText: {marginLeft: 5, fontSize: 13, color: colors.reportsTopTitle},
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.reportsDownloadBg,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  downloadText: {
    color: colors.reportsDownloadText,
    marginRight: 5,
    fontSize: 13,
  },

  orderCardContainer: {
    backgroundColor: colors.reportsCardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.reportsCardBorder,
    marginVertical: 10,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    margin: 10,
  },
  orderCardId: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 10,
  },
  rightHeaderBox: {
    alignItems: 'flex-end',
  },

  orderCardTime: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 4,
    fontWeight: '500',
  },

  orderCardItems: {
    fontSize: 14,
    color: colors.reportsCardItems,
    fontWeight: '500',
  },
  orderCardStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderCardRating: {
    backgroundColor: colors.reportsCardRatingBg,
    color: colors.reportsCardRatingText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 12,
    marginRight: 5,
  },
  orderCardStatus: {
    color: colors.textWhite,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    fontWeight: '600',
  },
  delivered: {backgroundColor: colors.reportsDelivered},
  cancelled: {backgroundColor: colors.reportsCancelled},
  otherStatus: {backgroundColor: colors.primarySemi},
  rejected: {backgroundColor: colors.reportsCancelled},

  orderCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    backgroundColor: colors.reportsCardBodyBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  orderItemsLeft: {flex: 1},
  orderItemsRight: {alignItems: 'flex-end'},
  orderCardItem: {
    fontSize: 13,
    color: colors.reportsCardItem,
    marginVertical: 2,
    lineHeight: 20,
  },

  orderCardPriceTag: {
    backgroundColor: colors.reportsPriceTagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 12,
  },
  orderCardPrice: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.reportsPrice,
  },

  listContent: {paddingBottom: 10},

  // Address block
  addressCard: {
    borderWidth: 0.8,
    borderColor: colors.reportsCardBorder,
    backgroundColor: colors.reportsCardBodyBg,
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
  },
  addressTitle: {fontSize: 13, fontWeight: '600', color: colors.textDark},
  addressText: {fontSize: 13, color: colors.textMedium, marginTop: 7},

  // Total Bill
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 12,
  },
  totalBill: {fontSize: 14, color: colors.textDark, fontWeight: '500'},
  totalPrice: {fontSize: 14, fontWeight: 'bold', color: colors.totalPrice},
});
