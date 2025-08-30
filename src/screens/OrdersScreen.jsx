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
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import {emoji} from '../assets/index';
import {Ordersscreenimage} from '../assets/index';
import {RestaurantLogo} from '../assets/index';
import OrderCard from '../components/OrderCard';

const allOrders = [
  {
    id: '230820257934322',
    status: 'Pending',
    date: '23/08/2025',
    time: '8:00 PM',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',

    items: [
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 900,
    paymentMethod: 'COD',
    cookingRequest: 'Please send extra tissues and spoons.',
  },
  {
    id: '230820257934323',
    status: 'Pending',
    date: '23/08/2025',
    time: '9:00 PM',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',

    items: [
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 1900,
    paymentMethod: 'cash',
  },
  {
    id: '230820257934324',
    status: 'Preparing',
    time: '8:05 PM',
    date: '23/08/2025',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india ',
    items: [
      {name: 'Paneer Butter Masala', quantity: 2, price: 250, isVeg: true},
      {name: 'Naan', quantity: 4, price: 50, isVeg: true},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 700,
    paymentMethod: 'Online',
  },
  {
    id: '230820257934325',
    status: 'Ready',
    time: '8:10 PM',
    date: '23/08/2025',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 800,
    paymentMethod: 'COD',
    driverInfo: {name: 'Manoj', orderId: '425424814'},
  },
  {
    id: '230820257934326',
    status: 'Picked up',
    paymentMethod: 'COD',

    time: '8:00 PM',
    date: '23/08/2025',

    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
    ],
    total: 900,
  },
  {
    id: '230820257934327',
    status: 'Picked up',
    paymentMethod: 'cash',

    time: '8:10 PM',
    date: '23/08/2025',
    address:
      '14-105/1, Vl puram, Rehamanth nagar colony, rajamahendravaram,andhrapradesh,533102, india',
    items: [
      {name: 'Chicken Dum Biryani', quantity: 1, price: 350, isVeg: false},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 450, isVeg: false},
      {name: 'Paneer Butter Masala', quantity: 1, price: 350, isVeg: true},
      {name: 'Mutton Dum Biryani', quantity: 1, price: 550, isVeg: false},
    ],
    total: 800,
  },
];

export default function OrdersScreen({navigation}) {
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
    const commonProps = {
      order,
      onPressAddress: () => navigation.navigate('OrderDetailsScreen', {order}),
    };

    switch (order.status) {
      case 'Pending':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Pending">
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.rejectButton}>
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>Confirm Now</Text>
              </TouchableOpacity>
            </View>
          </OrderCard>
        );

      case 'Preparing':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Preparing">
            <TouchableOpacity style={styles.orderReadyButton}>
              <Text style={styles.orderReadyButtonText}>Order Ready</Text>
            </TouchableOpacity>
          </OrderCard>
        );

      case 'Ready':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Ready">
            {/* Driver info */}
            <View style={styles.card3}>
              <Image source={emoji} style={styles.avatar3} />
              <View style={styles.textContainer}>
                <Text style={styles.subtitle3}>Manoj is on the way</Text>
                <Text style={styles.orderId3}>
                  ORDER ID : <Text style={styles.bold}>4254248142121</Text>
                </Text>
              </View>
              <TouchableOpacity>
                <Icon name="call" size={20} color="#1A43BF" />
              </TouchableOpacity>
            </View>
          </OrderCard>
        );

      case 'Picked up':
        return (
          <OrderCard
            key={order.id}
            {...commonProps}
            statusColor={colors.primarySemi}
            statusLabel="Picked up"
          />
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
            <Image source={Ordersscreenimage} style={styles.emptyOrdersImage} />
            {/* ✅ Online / Offline toggle text */}
            <Text
              style={[
                styles.onlineText,
                {color: isOn ? colors.onlineGreen : colors.danger},
              ]}>
              You are {isOn ? 'online' : 'offline'}.
            </Text>
            <Text style={styles.waitingText}>
              {isOn
                ? 'waiting for new orders'
                : 'switch on to start receiving orders'}
            </Text>
          </View>
        </View>
      );
    }
    return orders.map(order => renderOrderCard(order));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
      />

      <View style={styles.header}>
        <Image source={RestaurantLogo} style={styles.avatar} />
        <Text style={styles.restaurantName}>
          Bismillah Family Indian Restaurant
        </Text>
        <TouchableOpacity
          style={[
            styles.toggleContainer,
            isOn ? styles.toggleOn : styles.toggleOff, // 👈 use stylesheet
          ]}
          activeOpacity={0.8}
          onPress={toggleSwitch}>
          <Animated.View style={[styles.circle, {transform: [{translateX}]}]} />
        </TouchableOpacity>
      </View>

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
    backgroundColor: colors.background,
    paddingTop: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: colors.background,
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
    color: colors.textDark,
  },
  toggleContainer: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 4,
  },
  toggleOn: {
    backgroundColor: '#00CE9C',
  },
  toggleOff: {
    backgroundColor: '#ccc',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
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
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
  },
  tabTextActive: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
  },

  scrollViewContent: {
    paddingBottom: 10,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginVertical: 10,
  },
  rejectButton: {
  flex: 0.7, 
  marginRight: 8,
  borderWidth: 1,
  borderColor: colors.danger,
  borderRadius: 6,
  paddingVertical: 8,
  alignItems: 'center',
},
  rejectButtonText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
confirmButton: {
  flex: 1.3,  
  marginLeft: 8,
  backgroundColor: colors.success,
  borderRadius: 6,
  paddingVertical: 8,
  alignItems: 'center',
},
  confirmButtonText: {
    color: colors.textWhite,
    fontWeight: 'bold',
  },
  orderReadyButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  orderReadyButtonText: {
    color: colors.textWhite,
    fontWeight: 'bold',
  },

  card3: {
    borderRadius: 5,
    borderWidth: 0.65,
    borderColor: colors.borderLight,
    opacity: 1,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginVertical: 10,
  },
  avatar3: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.primary,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle3: {
    fontSize: 13,
    color: colors.textMedium,
    marginBottom: 2,
  },
  orderId3: {
    fontSize: 13,
    color: colors.textDark,
  },
  bold: {
    fontWeight: '600',
  },

  onlineSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  onlineText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    color: colors.onlineGreen,
  },
  waitingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 4,
  },

  emptyOrdersImage: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
});
