import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import  {colors}  from '../config/theme'; 


// ✅ Veg/NonVeg Icon Component
const VegNonVegIcon = ({isVeg}) => (
  <View style={{marginRight: 6}}>
    <Icon
      name="square-outline"
      size={16}
      color={isVeg ? colors.menuVeg : colors.menuNonVeg}
    />
    <Icon
      name="ellipse"
      size={8}
      color={isVeg ? colors.menuVeg : colors.menuNonVeg}
      style={{position: 'absolute', top: 4, left: 4}}
    />
  </View>
);

// ✅ Custom Toggle
const CustomToggle = ({value, onChange}) => {
  const translateX = new Animated.Value(value ? 19 : 0);

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: value ? 0 : 19,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onChange(!value);
  };

  return (
    <TouchableOpacity
      style={[
        styles.toggleContainer,
        {backgroundColor: value ? colors.accent : colors.toggleOff},
      ]}
      activeOpacity={0.8}
      onPress={toggleSwitch}>
      <Animated.View
        style={[styles.toggleCircle, {transform: [{translateX}]}]}
      />
    </TouchableOpacity>
  );
};

export default function MenuScreen() {
  const [menuData, setMenuData] = useState([
    {
      id: '1',
      name: 'Masala Vada',
      price: 50,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: true,
    },
    {
      id: '2',
      name: 'Plain Dosa',
      price: 150,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: true,
    },
    {
      id: '3',
      name: 'Upma',
      price: 250,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: true,
    },
  ]);
  const [menuData2, setMenuData2] = useState([
    {
      id: '1',
      name: 'Chicken Biryani',
      price: 250,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: false,
    },
    {
      id: '2',
      name: 'Mutton Biryani',
      price: 350,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: false,
    },
    {
      id: '3',
      name: 'Veg Biryani',
      price: 200,
      image: require('../assets/RestaurantLogo.png'),
      isVeg: true,
    },
  ]);

  const [breakfastToggles, setBreakfastToggles] = useState({});
  const [biryaniToggles, setBiryaniToggles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPrice, setMenuPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');

  // ✅ Confirmation Card State
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  // ✅ Toggle Handlers
  const handleBreakfastToggle = (id, newValue) => {
    setBreakfastToggles(prev => ({...prev, [id]: newValue}));
  };
  const handleBiryaniToggle = (id, newValue) => {
    setBiryaniToggles(prev => ({...prev, [id]: newValue}));
  };

  // ✅ Open modal
  const openEditCard = item => {
    setSelectedItem(item);
    setMenuPrice(item.price.toString());
    setDiscountPrice('');
    setModalVisible(true);
  };

  // ✅ Save updated price and show confirmation
  const handleUpdate = () => {
    if (!selectedItem) return;

    const updatedPrice = discountPrice
      ? parseFloat(menuPrice) - parseFloat(discountPrice)
      : parseFloat(menuPrice);

    if (menuData.some(item => item.id === selectedItem.id)) {
      setMenuData(prev =>
        prev.map(item =>
          item.id === selectedItem.id ? {...item, price: updatedPrice} : item,
        ),
      );
    }
    if (menuData2.some(item => item.id === selectedItem.id)) {
      setMenuData2(prev =>
        prev.map(item =>
          item.id === selectedItem.id ? {...item, price: updatedPrice} : item,
        ),
      );
    }

    setModalVisible(false);
    setConfirmationVisible(true); // ✅ Show confirmation card
  };

  // ✅ Auto-close confirmation after 3 seconds
  useEffect(() => {
    if (confirmationVisible) {
      const timer = setTimeout(() => {
        setConfirmationVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationVisible]);

  // ✅ Card
  const renderCard = ({item, toggles, onToggleChange}) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.foodImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <VegNonVegIcon isVeg={item.isVeg} />
          <Text style={styles.foodName}>{item.name}</Text>
        </View>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

      <View style={styles.rightSection}>
        <CustomToggle
          value={toggles[item.id] || false}
          onChange={value => onToggleChange(item.id, value)}
        />
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEditCard(item)}>
          <Text style={styles.editText}>Edit</Text>
          <Icon name="chevron-forward" size={16} color={colors.editBtn} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Image
          source={require('../assets/RestaurantLogo.png')}
          style={styles.headerImage}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Bismillah Family Indian Restaurant
          </Text>
          <Text style={styles.headerSubtitle}>
            Mangalagiri , tenali road, guntur distict , Andhra pradesh.
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchcontainer1}>
        <Icon
          name="search-outline"
          size={20}
          color={colors.searchOutline}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search item..."
          placeholderTextColor={colors.searchOutline}
        />
      </View>
      <ScrollView>
        {/* Breakfast Section */}
        <Text style={styles.sectionTitle}>Break Fast Recipes</Text>
        <FlatList
          data={menuData}
          renderItem={({item}) =>
            renderCard({
              item,
              toggles: breakfastToggles,
              onToggleChange: handleBreakfastToggle,
            })
          }
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        {/* Biryani Section */}
        <Text style={styles.sectionTitle}>Biryani's</Text>
        <FlatList
          data={menuData2}
          renderItem={({item}) =>
            renderCard({
              item,
              toggles: biryaniToggles,
              onToggleChange: handleBiryaniToggle,
            })
          }
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        {/* ✅ Modal for Update */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.updateCard}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}>
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
              <View style={styles.row}>
                <VegNonVegIcon isVeg={selectedItem?.isVeg} />
                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              </View>
              <View style={styles.divider} />

              <Text style={styles.label}>Menu Price</Text>
              <TextInput
                style={styles.inputBox}
                value={menuPrice}
                keyboardType="numeric"
                onChangeText={setMenuPrice}
              />

              <Text style={styles.label}>
                Discount Price{' '}
                <Text style={colors.searchOutline}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.inputBox}
                value={discountPrice}
                keyboardType="numeric"
                onChangeText={setDiscountPrice}
              />

              <View style={styles.bottomRow}>
                <Text style={styles.totalText}>
                  Total Amount : ₹
                  {menuPrice && discountPrice
                    ? menuPrice - discountPrice
                    : menuPrice}
                </Text>
                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={handleUpdate}>
                  <Text style={styles.updateBtnText}>Update</Text>
                  <Icon
                    name="play"
                    size={14}
                    color={colors.menuCardBg}
                    style={{marginLeft: 5}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ✅ Confirmation Card Modal */}
        <Modal visible={confirmationVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.confirmCard}>
              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setConfirmationVisible(false)}>
                <Icon name="close" size={22} color={colors.closeButton} />
              </TouchableOpacity>

              {/* Checkmark */}
              <View style={{alignItems: 'center', marginBottom: 15}}>
                <Icon name="checkmark-circle" size={64} color="green" />
              </View>

              {/* Message */}
              <Text style={styles.confirmText}>
                “Your applied for Withdraw Request“
              </Text>

              {/* Yahoo Thanks */}
              <TouchableOpacity onPress={() => setConfirmationVisible(false)}>
                <Text style={styles.thanksText}>Yahooo! Thanks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.white, padding: 10, paddingTop: 25},
  headerCard: {
    height: 103,
    backgroundColor: colors.lightBlue,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    marginTop: 20,
    borderWidth: 0.75,
    borderColor: colors.black,
  },
  headerImage: {
    height: 74,
    width: 74,
    borderRadius: 41,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: colors.black2,
  },
  headerTextContainer: {flex: 1},
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.menuText,
    marginBottom: 4,
  },
  headerSubtitle: {fontSize: 12, color: colors.black3, lineHeight: 15},
  searchcontainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 47,
    shadowColor: colors.menuText,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  icon: {marginRight: 5},
  input: {flex: 1, fontSize: 16, color:colors.grey},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 101,
    borderRadius: 15,
    borderWidth: 0.75,
    borderColor: colors.black,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
    shadowColor: colors.black4,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 1,
  },
  foodImage: {height: 82, width: 77, borderRadius: 10},
  cardContent: {flex: 1, marginLeft: 10},
  row: {flexDirection: 'row', alignItems: 'center'},
  foodName: {fontSize: 14, fontWeight: '500'},
  price: {fontSize: 14, fontWeight: 'bold', marginTop: 5},
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 10,
  },
  editBtn: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  editText: {color: colors.editBtn, fontWeight: '500', fontSize: 13, marginRight: 3},
  toggleContainer: {
    width: 38,
    height: 19,
    borderRadius: 59,
    padding: 2,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.white,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.black5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateCard: {
    width: 340,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 20,
    elevation: 4,
  },
  closeBtn: {position: 'absolute', top: 10, right: 10, padding: 6, zIndex: 1},
  modalTitle: {fontSize: 15, fontWeight: '500', color: '#1A43BF'},
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.black4,
    marginVertical: 15,
  },
  label: {fontSize: 14, fontWeight: '500', marginBottom: 8},
  inputBox: {
    height: 45,
    borderWidth: 0.5,
    borderColor: colors.black6,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.black4,
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 8,
  },
  totalText: {color: '#fff', fontSize: 14, fontWeight: '500'},
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 19,
  },
  updateBtnText: {color: colors.white, fontWeight: '500', fontSize: 13},

  // ✅ Confirmation Card Styles
  confirmCard: {
    width: 300,
    height: 266,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.closeButton,
    textAlign: 'center',
    marginBottom: 20,
  },
  thanksText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.editBtn,
  },
});
