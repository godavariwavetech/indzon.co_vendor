import {useSelector} from 'react-redux';
import {DEMO_MODE} from '../demo/config';
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import  {colors}  from '../config/theme'; 


export default function BillSummary({navigation, route}) {
  const auth = useSelector(state => state.Auth);
  const order = [...auth.pendingOrders, ...auth.OrdersInProcess, ...auth.dashboardOrders].find(o => o.id === route.params?.order?.id) || route.params?.order || auth.dashboardOrders[0];
  if (!DEMO_MODE) return <ProductionBillSummary navigation={navigation} />;
  return <View style={styles.container}>
    <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-back" size={22} color={colors.textDark} /></TouchableOpacity>
      <View style={styles.headerTextContainer}><Text style={styles.orderId}>ORDER #{order.order_id}</Text><Text style={styles.subText}>{order.customer.name} - {order.payment_status}</Text></View>
      <TouchableOpacity onPress={() => navigation.navigate('CustomerSupportScreen')}><Text style={styles.helpText}>HELP</Text></TouchableOpacity>
    </View>
    <ScrollView contentContainerStyle={styles.scrollContainer}><View style={styles.card}><Text style={styles.billSummary}>Bill Summary</Text><View style={styles.divider} />
      {order.items.map(item => <View key={item.product_id} style={styles.itemRow}><Text style={styles.itemText}>{item.quantity} x {item.name}</Text><Text style={styles.itemPrice}>₹{(item.quantity * item.price).toFixed(2)}</Text></View>)}
      {[['GST (5%)', order.total_item_gst_amount], ['Delivery', order.delivery_charges], ['Coupon', -order.coupon_amount]].map(([label, value]) => <View key={label} style={styles.itemRow}><Text style={styles.taxText}>{label}</Text><Text style={styles.itemPrice}>₹{Number(value).toFixed(2)}</Text></View>)}
      <View style={styles.totalBox}><Text style={styles.totalText}>Grand Total</Text><Text style={styles.totalPrice}>₹{order.grand_total.toFixed(2)}</Text></View>
    </View></ScrollView>
  </View>;
}

function ProductionBillSummary({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.orderId}>ORDER #100021</Text>
          <Text style={styles.subText}>Delivered , 2 Item , ₹612</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.helpText}>HELP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.billSummary}>Bill Summary</Text>
          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Icon name="caret-up-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.itemText}>1 x Chicken Dum Biryani</Text>
            <Text style={styles.itemPrice}>₹400</Text>
          </View>
          <View style={styles.itemRow}>
            <Icon name="caret-up-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.itemText}>1 x Chicken Fry Biryani</Text>
            <Text style={styles.itemPrice}>₹400</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.taxText}>CSGT ( 2.5% )</Text>
            <Text style={styles.itemPrice}>₹20</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.taxText}>SGST ( 2.5% )</Text>
            <Text style={styles.itemPrice}>₹20</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.couponText}>Coupon applied - Bismil50</Text>
            <Text style={styles.couponAmount}>-₹100</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.commissionText}>Quickiee commission ( 35% )</Text>
            <Text style={styles.commissionAmount}>-₹128</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Grand Total</Text>
            <Text style={styles.totalPrice}>₹612</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
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
