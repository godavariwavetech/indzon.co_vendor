import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../config/theme';
import VegNonVegIcon from '../components/VegNonVegIcon';
import { ItemLogo } from '../assets/index';

export default function OrderDetailsScreen({ route }) {
  const { order } = route.params;
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <ScrollView Style={styles.contentContainerStyle}>
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID - {order.id}</Text>
          <Text style={styles.orderTime}>
            {order.date} {order.time}
          </Text>
          <View style={styles.divider} />

          {order.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
                
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
         <Image source={ItemLogo} style={styles.logo} />

              <VegNonVegIcon isVeg={item.isVeg} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.footerRow}>
            <View style={styles.billLeft}>
              <Text style={styles.totalBillLabel}>Total Bill</Text>

              <View style={styles.paymentBadge}>
                <View style={styles.dot} />
                <Text style={styles.paymentText}>
                  {order.paymentMethod || 'COD'}
                </Text>
              </View>
            </View>

            <Text style={styles.totalPrice}>₹{order.total}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background , Top:50},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: colors.textWhite,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingTop:50,
    borderBottomWidth:1,
    borderColor:"lightgrey"
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
contentContainerStyle:{paddingBottom:20},
  orderCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop:30
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  orderTime: { fontSize: 14,fontWeight: 'bold', color: colors.textMedium, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 10 },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemQuantity: { marginRight: 6, fontWeight: '500', borderWidth:0.5, paddingHorizontal:7,padding:4, borderRadius:5, backgroundColor:"#1A43BF1F" },
  itemName: { flex: 1, fontSize: 14 },
  itemPrice: { fontWeight: 'bold' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalBillLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginRight: 10,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7ECFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
    marginRight: 5,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
    logo: {
    width: 33,
    height: 33,
    borderRadius: 50,
    marginRight:5
  },
});
