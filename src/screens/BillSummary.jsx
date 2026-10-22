import React, {useState, useEffect, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import {fetchOrderDetails} from '../redux/reducers/auth';

export default function BillSummary({navigation, route}) {
  const order = route.params?.order;
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!order?.id) return;
    setLoading(true);
    setError(null);
    try { setItems(await dispatch(fetchOrderDetails(order.id)).unwrap()); }
    catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  }, [order?.id, dispatch]);
  useEffect(() => { load(); }, [load]);
  const money = value => `\u20B9${Number(value || 0).toFixed(2)}`;
  return <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-back" size={22} color={colors.textDark} /></TouchableOpacity>
      <View style={styles.headerTextContainer}><Text style={styles.orderId}>{order ? `ORDER #${order.order_id}` : 'Bill Summary'}</Text></View>
      <TouchableOpacity onPress={() => navigation.navigate('CustomerSupportScreen')}><Text style={styles.helpText}>HELP</Text></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {!order ? <Text>No order selected.</Text> : loading ? <ActivityIndicator color={colors.primary} /> : error ? <TouchableOpacity onPress={load}><Text>{error} - Tap to retry</Text></TouchableOpacity> :
      <View style={styles.card}><Text style={styles.billSummary}>Bill Summary</Text><View style={styles.divider} />
        {items.length === 0 && <Text>No items found.</Text>}
        {items.map((item, index) => <View key={index} style={styles.itemRow}><Text style={styles.itemText}>{item.quantity} x {item.name}</Text><Text style={styles.itemPrice}>{money(Number(item.quantity) * Number(item.price))}</Text></View>)}
        {[['GST', items[0]?.total_item_gst_amount], ['Delivery', order.delivery_charges], ['Coupon', -Number(order.coupon_amount || 0)]].map(([label, value]) => <View key={label} style={styles.itemRow}><Text style={styles.taxText}>{label}</Text><Text style={styles.itemPrice}>{money(value)}</Text></View>)}
        <View style={styles.totalBox}><Text style={styles.totalText}>Grand Total</Text><Text style={styles.totalPrice}>{money(order.grand_total)}</Text></View>
      </View>}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.billHeaderBg,
    padding: 18,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textDark,
  },
  subText: {
    fontSize: 13,
    color: colors.billSubText,
  },
  helpText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textDark,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    shadowColor: colors.textDark,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  billSummary: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    backgroundColor: colors.divider,
    marginBottom: 10,
    borderStyle: "dashed",
    borderWidth: 0.75,
    borderColor: colors.borderLight,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
    color: colors.textMedium,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMedium,
  },
  taxText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMedium,
  },
  couponText: {
    flex: 1,
    fontSize: 14,
    color: colors.billCoupon,
  },
  couponAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.billCoupon,
  },
  commissionText: {
    flex: 1,
    fontSize: 14,
    color: colors.billCommission,
  },
  commissionAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.billCommission,
  },
  totalBox: {
    backgroundColor: colors.billTotalBg,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginTop: 14,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
