import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';

import Icon from 'react-native-vector-icons/Ionicons'; // ✅ Needed for VegNonVegIcon

// Mock Data for orders
const allOrders = [
  {
    id: 'ID-34323',
    status: 'Pending',
    time: '8:00 PM',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 900,
    paymentMethod: 'COD',
    cookingRequest: 'Please send extra tissues and spoons.',
    customerName: 'Kali krishna',
  },
  {
    id: 'ID-34324',
    status: 'Preparing',
    time: '8:05 PM',
    items: [
      {name: 'Paneer Butter Masala', quantity: 2, price: 250, isVeg: true},
      {name: 'Naan', quantity: 4, price: 50, isVeg: true},
    ],
    total: 700,
    paymentMethod: 'Online',
    cookingRequest: 'Make it less spicy.',
    customerName: 'John Doe',
  },
  {
    id: 'ID-34325',
    status: 'Ready',
    time: '8:10 PM',
   items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 800,
    paymentMethod: 'COD',
    driverInfo: {name: 'Manoj', orderId: '425424814'},
  },
  {
    id: 'ORD10001',
    status: 'Picked up',
    time: '8:00 PM',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 800,
  },
  {
    id: 'ID-34323-2',
    status: 'Picked up',
    time: '8:00 PM',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 800,
  },
];

// ✅ Veg / Non-Veg Icon Component
const VegNonVegIcon = ({isVeg, useIonicons = true}) => {
  if (useIonicons) {
    return (
      <View style={{marginRight: 6}}>
        <Icon
          name="square-outline"
          size={16}
          color={isVeg ? '#00C48C' : '#FF4D4D'}
        />
        <Icon
          name="ellipse"
          size={8}
          color={isVeg ? '#00C48C' : '#FF4D4D'}
          style={{position: 'absolute', top: 4, left: 4}}
        />
      </View>
    );
  }

  // ✅ Default fallback (custom square + dot like Swiggy/Zomato)
  return (
    <View
      style={[
        styles.vegNonVegContainer,
        {borderColor: isVeg ? '#00C48C' : '#FF4D4D'},
      ]}>
      <View
        style={[styles.dot, {backgroundColor: isVeg ? '#00C48C' : '#FF4D4D'}]}
      />
    </View>
  );
};

export default function OrdersScreen() {
  const [isOn, setIsOn] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Pending');
  const translateX = new Animated.Value(isOn ? 32 : 0);

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: isOn ? 0 : 32,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsOn(!isOn);
  };

  const orders = allOrders.filter(order => order.status === selectedTab);

  const getTabCount = status =>
    allOrders.filter(order => order.status === status).length;

  const tabs = [
    {label: 'Pending', count: getTabCount('Pending')},
    {label: 'Preparing', count: getTabCount('Preparing')},
    {label: 'Ready', count: getTabCount('Ready')},
    {label: 'Picked up', count: getTabCount('Picked up')},
  ];

  const renderOrderCard = order => {
    switch (order.status) {
      case 'Pending':
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderId}>ID-{order.id.split('-')[1]}</Text>
                <TouchableOpacity>
                <Icon name="copy-outline" size={16} color="#000" />

                </TouchableOpacity>
              </View>
              <Text style={styles.orderTime}>{order.time}</Text>
            </View>
            <View style={styles.divider} />

            {order.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <VegNonVegIcon isVeg={item.isVeg} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}
            <View style={styles.divider} />

            <View style={styles.totalContainer}>
              <View style={styles.Totalbillcontainer}>
                <Text style={styles.totalBill}>Total Bill</Text>
                <View style={styles.paymentMethod}>
                  <Text style={styles.codText}>● COD</Text>
                </View>
              </View>
              <Text style={styles.totalPrice}>₹{order.total}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                {/* Profile Image */}
                <Image
                  source={require('../assets/RestaurantLogo.png')} // replace with actual image
                  style={styles.avatar2}
                />
                <Text style={styles.title}>
                  Cooking Request from Kali krishna
                </Text>
              </View>

              <Text style={styles.subtitle}>
                • Please send extra tissues and spoons.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.rejectButton}>
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirm Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'Preparing':
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>ID-{order.id.split('-')[1]}</Text>
              <Text style={styles.orderTime}>{order.time}</Text>
            </View>
            <View style={styles.statusBadgePreparing}>
              <Text style={styles.statusBadgeText}>Preparing</Text>
            </View>
            <View style={styles.divider} />

            {order.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <VegNonVegIcon isVeg={item.isVeg} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}
            <View style={styles.divider} />

             <View style={styles.totalContainer}>
              <View style={styles.Totalbillcontainer}>
                <Text style={styles.totalBill}>Total Bill</Text>
                <View style={styles.paymentMethod}>
                  <Text style={styles.codText}>● COD</Text>
                </View>
              </View>
              <Text style={styles.totalPrice}>₹{order.total}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                {/* Profile Image */}
                <Image
                  source={require('../assets/RestaurantLogo.png')} // replace with actual image
                  style={styles.avatar2}
                />
                <Text style={styles.title}>
                  Cooking Request from Kali krishna
                </Text>
              </View>

              <Text style={styles.subtitle}>
                • Please send extra tissues and spoons.
              </Text>
            </View>

            <TouchableOpacity style={styles.orderReadyButton}>
              <Text style={styles.orderReadyButtonText}>Order ready</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Ready':
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>ID-{order.id.split('-')[1]}</Text>
              <Text style={styles.orderTime}>{order.time}</Text>
            </View>
            <View style={styles.statusBadgeReady}>
              <Text style={styles.statusBadgeText}>Ready</Text>
            </View>

                        <View style={styles.divider} />

            {order.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <VegNonVegIcon isVeg={item.isVeg} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}

                        <View style={styles.divider} />

            <View style={styles.totalContainer}>
              <View style={styles.Totalbillcontainer}>
                <Text style={styles.totalBill}>Total Bill</Text>
                <View style={styles.paymentMethod}>
                  <Text style={styles.codText}>● COD</Text>
                </View>
              </View>
              <Text style={styles.totalPrice}>₹{order.total}</Text>
            </View>




           <View style={styles.card3}>
      {/* Left: Avatar */}
      <Image
        source={require('../assets/RestaurantLogo.png')} // replace with actual profile image
        style={styles.avatar3}
      />

      {/* Middle: Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.subtitle3}>Manoj is on the way</Text>
        <Text style={styles.orderId3}>
          ORDER ID : <Text style={styles.bold}>425424814</Text>
        </Text>
      </View>

      {/* Right: Call Icon */}
      <TouchableOpacity>
        <Icon name="call-outline" size={20} color="#1A43BF" />
      </TouchableOpacity>
    </View>
          </View>




        );
      case 'Picked up':
        return (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.orderTime}>{order.time}</Text>
            </View>
            <View style={styles.divider} />

            {order.items.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                <VegNonVegIcon isVeg={item.isVeg} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}
                <View style={styles.divider} />

            <View style={styles.totalContainerSimple}>
              <Text style={styles.totalBill}>Total bill : </Text>
              <Text style={styles.totalPriceBold}>₹{order.total}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (orders.length === 0) {
      return (
        <View>
          <AdvertisementsCarousel />
          <View style={styles.onlineSection}>
            <Image
              source={{uri: 'https://i.imgur.com/BZNqlbI.png'}}
              style={{width: 300, height: 200, resizeMode: 'contain'}}
            />
            <Text style={styles.onlineText}>You are online.</Text>
            <Text style={styles.waitingText}>waiting for new orders</Text>
          </View>
        </View>
      );
    }
    return orders.map(order => renderOrderCard(order));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor={'transparent'} />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/RestaurantLogo.png')}
          style={styles.avatar}
        />
        <Text style={styles.restaurantName}>
          Bismillah Family Indian Restaurant
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleContainer,
            {backgroundColor: isOn ? '#00CE9C' : '#ccc'},
          ]}
          activeOpacity={0.8}
          onPress={toggleSwitch}>
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={[
              styles.tabButton,
              selectedTab === tab.label && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.label)}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.label && styles.tabTextActive,
              ]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },

  // ✅ Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  restaurantName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleContainer: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 4,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },

  // ✅ Tabs
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    elevation: 2,
    paddingVertical: 8,
    marginVertical: 7,
  },
  tabButton: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#0000001A',
  },
  tabButtonActive: {
    backgroundColor: '#1A43BF33',
    borderWidth: 1,
    borderColor: '#1A43BF33',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E6E',
  },
  tabTextActive: {
    fontSize: 12,
    color: '#000000BF',
    fontWeight: 'bold',
  },

  // ✅ ScrollView
  scrollViewContent: {
    padding: 12,
  },

  // ✅ Orders
  orderCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 5,
    marginVertical: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderIdContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  orderId: {
    fontWeight: '500',
    fontSize: 14,
    color: '#1A43BF',
  },
  orderTime: {
    fontSize: 14,
    color: '#000000B2',
    fontWeight: '500',
  },

  // ✅ Items
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemQuantity: {
    fontWeight: '500',
    marginRight: 8,
    color: '#333',
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderColor: '#00000080',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 400,
    color: '#000000',
  },
  itemPrice: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000000A6',
  },

  // ✅ Veg/Non-Veg
  vegNonVegContainer: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ✅ Total Bill
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  totalContainerSimple: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 8,
  },
  totalBill: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPriceBold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  Totalbillcontainer: {
    gap: 20,
    flexDirection: 'row',
  },
  paymentMethod: {
    borderRadius: 5,
    backgroundColor: '#1A43BF33',
    paddingHorizontal: 6,
    padding: 2,
  },
  codText: {
    fontSize: 11,
    color: '#1A43BF',
  },

  // ✅ Cooking Request
  card: {
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#1A43BF',
    backgroundColor: '#1A43BF33',
    opacity: 1,
    padding: 8,
    justifyContent: 'center',
    marginVertical: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar2: {
    width: 21,
    height: 21,
    borderRadius: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#444',
    marginTop: 15,
    marginLeft: 25, // little left padding so bullet aligns nicely
  },
  // ✅ Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginVertical: 10,
  },
  rejectButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FF4D4D',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#0AA007',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderReadyButton: {
    backgroundColor: '#1A43BF',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  orderReadyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ✅ Status Badges
  statusBadgePreparing: {
    backgroundColor: '#1A43BFB2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    
  },
  statusBadgeReady: {
    backgroundColor: '#1A43BFB2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // ✅ Driver Info
 card3: {
  
    borderRadius: 5,
    borderWidth: 0.65,
    borderColor: "#00000040",
    opacity: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical:15,
    marginVertical:10
  },
  avatar3: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#1A43BF", // fallback background color
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  subtitle3: {
    fontSize: 13,
    color: "#000000B2",
    marginBottom: 2,
  },
  orderId3: {
    fontSize: 13,
    color: "#000000",
  },
  bold: {
    fontWeight: "600",
  },

  // ✅ Online Section
  onlineSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  onlineText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  waitingText: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0', // light gray
    marginVertical: 12,
  },
});
