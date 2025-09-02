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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../config/theme';
import {ItemLogo, RestaurantLogo} from '../assets/index';
import UpdateModal from '../components/UpdateModal';
import ConfirmationModal from '../components/ConfirmationModal';

    <MaterialCommunityIcons name="chevron-right" size={16} />


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
        value ? styles.toggleOn : styles.toggleOff,
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
    {id: '1', name: 'Masala Vada', price: 50, image: ItemLogo, isVeg: true},
    {id: '2', name: 'Plain Dosa', price: 150, image: ItemLogo, isVeg: true},
    {id: '3', name: 'Upma', price: 250, image: ItemLogo, isVeg: true},
  ]);

  const [menuData2, setMenuData2] = useState([
    {id: '1', name: 'Chicken Biryani', price: 250, image: ItemLogo, isVeg: false},
    {id: '2', name: 'Mutton Biryani', price: 350, image: ItemLogo, isVeg: false},
    {id: '3', name: 'Veg Biryani', price: 200, image: ItemLogo, isVeg: true},
  ]);

  const [breakfastToggles, setBreakfastToggles] = useState({});
  const [biryaniToggles, setBiryaniToggles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPrice, setMenuPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const handleBreakfastToggle = (id, newValue) => {
    setBreakfastToggles(prev => ({...prev, [id]: newValue}));
  };
  const handleBiryaniToggle = (id, newValue) => {
    setBiryaniToggles(prev => ({...prev, [id]: newValue}));
  };

  const openEditCard = item => {
    setSelectedItem(item);
    setMenuPrice(item.price.toString());
    setDiscountPrice('');
    setModalVisible(true);
  };

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
    setConfirmationVisible(true);
  };

  useEffect(() => {
    if (confirmationVisible) {
      const timer = setTimeout(() => {
        setConfirmationVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationVisible]);

  const renderCard = ({ item, toggles, onToggleChange }) => (
  <View style={styles.card}>
    <Image source={item.image} style={styles.foodImage} resizeMode="cover" />
    <View style={styles.cardContent}>
      <View style={styles.row}>
        <MaterialCommunityIcons
          name="square-circle"
          size={16}
          color={item.isVeg ? colors.veg : colors.nonVeg}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.foodName}>{item.name}</Text>
      </View>
      <Text style={styles.price}>₹{item.price}</Text>
    </View>

    <View style={styles.rightSection}>
      <CustomToggle
        value={toggles[item.id] || false}
        onChange={(value) => onToggleChange(item.id, value)}
      />
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => openEditCard(item)}>
        <Text style={styles.editText}>Edit</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={16}
          color={colors.editBtn}
        />
      </TouchableOpacity>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Image source={RestaurantLogo} style={styles.headerImage} />
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
        <MaterialCommunityIcons
          name="magnify"
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

      {/* Menu Lists */}
      <ScrollView>
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
      </ScrollView>

      {/* Extracted Modals */}
      <UpdateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        menuPrice={menuPrice}
        discountPrice={discountPrice}
        setMenuPrice={setMenuPrice}
        setDiscountPrice={setDiscountPrice}
        onUpdate={handleUpdate}
      />

      <ConfirmationModal
        visible={confirmationVisible}
        onClose={() => setConfirmationVisible(false)}
      />
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
  input: {flex: 1, fontSize: 16, color: colors.grey},
  sectionTitle: {fontSize: 16, fontWeight: '500', marginBottom: 8, marginTop: 10},
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
  toggleOn: {backgroundColor: colors.accent},
  toggleOff: {backgroundColor: colors.toggleOff},
  toggleCircle: {width: 15, height: 15, borderRadius: 7.5, backgroundColor: colors.white},
  vegIconContainer: {marginRight: 6},
  vegIconInner: {position: 'absolute', top: 4, left: 4},
});
