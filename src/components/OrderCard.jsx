import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../config/theme";

const OrderCard = ({
  order,
  statusColor,
  statusLabel,
  children, // 👈 extra actions like buttons or driver info
  onPressAddress,
}) => {
  return (
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
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusBadgeText}>{statusLabel}</Text>
      </View>

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

      {/* Extra (buttons, driver info etc) */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 5,
    marginVertical: 12,
    elevation: 3,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.black7,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderId: { fontWeight: "500", fontSize: 14, color: colors.primary },
  dateTimeContainer: { flexDirection: "row", gap: 10 },
  orderTime: { fontSize: 14, color: colors.textMedium, fontWeight: "500" },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "500", color: colors.textWhite },

  addressCard: {
    borderWidth: 0.8,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    marginVertical: 15,
  },
  addressTitle: { fontSize: 13, fontWeight: "600", color: colors.textDark },
  addressText: { fontSize: 13, color: colors.textMedium, marginTop: 7 },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  Totalbillcontainer: { flexDirection: "row", gap: 20 },
  totalBill: { fontSize: 14, color: colors.textDark, fontWeight: "500" },
  paymentMethod: {
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    padding: 2,
  },
  codText: { fontSize: 11, color: colors.primary, fontWeight: "500" },
  totalPrice: { fontSize: 14, fontWeight: "bold", color: colors.totalPrice },
});

export default OrderCard;
