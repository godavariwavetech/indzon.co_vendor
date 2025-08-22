import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import  {colors}  from '../config/theme'; 

const orders = [
  {
    id: "1",
    orderNo: "121321",
    items: ["1 x Chicken Biryani", "1 x Chicken Fry Biryani", "1 x Mutton Fry Biryani"],
    date: "09 June",
    time: "8:40 PM",
    status: "DELIVERED",
    rating: 4,
    price: 1300,
  },
  {
    id: "2",
    orderNo: "121322",
    items: [
      "14 x Panner Butter Masala",
      "1 x Alo Parota",
      "Addons : 1x onions , 3x minis , 1x onions , 3x minis",
    ],
    date: "09 June",
    time: "9:15 PM",
    status: "DELIVERED",
    rating: 5,
    price: 250,
  },
  {
    id: "3",
    orderNo: "121323",
    items: ["1 x Chicken Biryani", "1 x Chicken Fry Biryani", "1 x Mutton Fry Biryani"],
    date: "09 June",
    time: "10:05 PM",
    status: "CANCELLED",
    rating: null,
    price: null,
  },
];

export default function ReportsScreen() {
  // 🔹 State for date picker
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selecting, setSelecting] = useState("start");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const showDatePicker = (type) => {
    setSelecting(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = (date) => {
    if (selecting === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    hideDatePicker();
  };

  const formatDate = (date) => {
    if (!date) return "--";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  const renderOrder = ({ item }) => {
    return (
      <View style={styles.orderCardContainer}>
        {/* Header */}
        <View style={styles.orderCardHeader}>
          <Text style={styles.orderCardId}>Order # {item.orderNo}</Text>
          <Text style={styles.orderCardItems}>({item.items.length} Items)</Text>

          <View style={styles.orderCardStatusBox}>
            {item.rating ? <Text style={styles.orderCardRating}>{item.rating} ⭐</Text> : null}
            <Text
              style={[
                styles.orderCardStatus,
                {
                  backgroundColor:
                    item.status === "DELIVERED"
                      ? colors.reportsDelivered
                      : item.status === "CANCELLED"
                      ? colors.reportsCancelled
                      : colors.reportsOtherStatus,
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.orderCardBody}>
          <View style={{ flex: 1 }}>
            {item.items.map((food, index) => (
              <Text key={index} style={styles.orderCardItem}>
                {food}
              </Text>
            ))}
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.orderCardTime}>
              {item.time} | {item.date}
            </Text>
            {item.price ? (
              <View style={styles.orderCardPriceTag}>
                <Text style={styles.orderCardPrice}>₹{item.price}.00</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={22} color={colors.reportsTopTitle} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order History</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {/* Start Date */}
        <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker("start")}>
          <Icon name="calendar-outline" size={18} color={colors.reportsTopTitle} />
          <Text style={styles.dateText}>
            {startDate ? formatDate(startDate) : "Start Date"}
          </Text>
        </TouchableOpacity>

        {/* End Date */}
        <TouchableOpacity style={styles.datePicker} onPress={() => showDatePicker("end")}>
          <Icon name="calendar-outline" size={18} color={colors.reportsTopTitle} />
          <Text style={styles.dateText}>
            {endDate ? formatDate(endDate) : "End Date"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadBtn}>
          <Text style={styles.downloadText}>Download</Text>
          <Icon name="download-outline" size={18} color={colors.reportsDownloadText} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      {/* Date Picker Modal */}
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
  container: { flex: 1, backgroundColor: colors.reportsContainerBg, padding: 13, paddingTop: 40 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginHorizontal: 10,
    borderColor: colors.reportsBorder,
  },
  topTitle: { fontSize: 18, fontWeight: "600", color: colors.reportsTopTitle },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderWidth: 0.75,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: colors.reportsFilterBorder,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.reportsDateBorder,
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 40,
    marginRight: 8,
  },
  dateText: { marginLeft: 5, fontSize: 13, color: colors.reportsTopTitle },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.reportsDownloadBg,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  downloadText: { color: colors.reportsDownloadText, marginRight: 5, fontSize: 13 },

  // 🔹 Order Card Styles
  orderCardContainer: {
    backgroundColor: colors.reportsCardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.reportsCardBorder,
    marginVertical: 10,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
  },
  orderCardId: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.reportsCardId,
  },
  orderCardItems: {
    fontSize: 14,
    color: colors.reportsCardItems,
    fontWeight: "500",
  },
  orderCardStatusBox: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  orderCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    backgroundColor: colors.reportsCardBodyBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  orderCardItem: {
    fontSize: 13,
    color: colors.reportsCardItem,
    marginVertical: 2,
    lineHeight: 20,
  },
  orderCardTime: {
    fontSize: 12,
    color: colors.reportsCardTime,
    marginBottom: 5,
  },
  orderCardPriceTag: {
    backgroundColor: colors.reportsPriceTagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 12,
  },
  orderCardPrice: {
    fontWeight: "bold",
    fontSize: 14,
    color: colors.reportsPrice,
  },
});
