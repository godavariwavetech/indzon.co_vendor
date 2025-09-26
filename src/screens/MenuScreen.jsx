// src/screens/MenuScreen.jsx
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

import {useSelector, useDispatch} from 'react-redux';
import {fetchShopDetails, fetchProductsList,updateProduct,updateProductStatus} from '../redux/reducers/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import {RestaurantLogo} from '../assets/index';
import ConfirmationModal from '../components/ConfirmationModal';



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
  const dispatch = useDispatch();
  const {userId, shopDetails, products, loading} = useSelector(
    state => state.Auth,
  );

  const [toggles, setToggles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(fetchShopDetails(userId));
      dispatch(fetchProductsList(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
  if (products.length > 0) {
    const initialToggles = {};
    products.forEach(item => {
      // active_status: "0" = ON, "1" = OFF
      initialToggles[item.id] = item.active_status === "0";
    });
    setToggles(initialToggles);
  }
}, [products]);


  // 🔹 Group products by sub_category_id
  const groupedProducts = products.reduce((acc, item) => {
    if (!acc[item.sub_category_id]) {
      acc[item.sub_category_id] = {
        title: item.sub_category_name,
        data: [],
      };
    }
    acc[item.sub_category_id].data.push(item);
    return acc;
  }, {});

  const handleToggle = (id, newValue) => {
    setToggles(prev => ({...prev, [id]: newValue}));

      const active_status = newValue ? "0" : "1"; 
  dispatch(updateProductStatus({ id, shop_id: userId, active_status }))
    .unwrap()
    .then(() => {
      console.log(`Product ${id} status updated to ${active_status}`);
    })
    .catch(err => {
      console.error('Status update failed:', err);
    });
  };


  

  const openEditCard = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

 const handleUpdate = updatedValues => {
  dispatch(updateProduct({ ...updatedValues, shop_id: userId }))
    .unwrap()
    .then(() => {
      console.log('Product updated successfully');
      setModalVisible(false);
      setConfirmationVisible(true);
    })
    .catch(err => {
      console.error('Update failed:', err);
    });
};
  useEffect(() => {
    if (confirmationVisible) {
      const timer = setTimeout(() => {
        setConfirmationVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationVisible]);

  const renderCard = ({item}) => (
    <View style={styles.card}>
      <Image
        source={{uri: item.item_image}}
        style={styles.foodImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="square-circle"
            size={16}
            color={item.filter_one === 'Veg' ? colors.veg : colors.nonVeg}
            style={{marginRight: 6}}
          />
          <Text style={styles.foodName}>{item.item_name}</Text>
        </View>
        <View style={styles.priceRow}>
          {/* Always show selling price */}
          <Text style={styles.price}>₹{item.selling_price}</Text>

          {/* Show actual price only when it's greater than selling */}
          {item.actual_price &&
            parseFloat(item.actual_price) > parseFloat(item.selling_price) && (
              <Text style={styles.actualPrice}>₹{item.actual_price}</Text>
            )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <CustomToggle
          value={toggles[item.id] || false}
          onChange={value => handleToggle(item.id, value)}
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
      {/* 🔹 Restaurant Header */}
      <View style={styles.headerCard}>
        {loading && !shopDetails ? (
          <Text style={{padding: 10}}>Loading...</Text>
        ) : (
          <>
            <Image
              source={
                shopDetails?.image ? {uri: shopDetails.image} : RestaurantLogo
              }
              style={styles.headerImage}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {shopDetails?.name || 'Restaurant Name'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {shopDetails?.address || 'Restaurant Address'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* 🔹 Search */}
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

      {/* 🔹 Menu Lists from API */}
      <ScrollView>
        {Object.values(groupedProducts).map(section => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FlatList
              data={section.data}
              renderItem={renderCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        ))}
      </ScrollView>

      {/* 🔹 Update Modal */}
      <UpdateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        item={selectedItem}
        onUpdate={handleUpdate}
        userId={userId} 
      />

      <ConfirmationModal
        visible={confirmationVisible}
        onClose={() => setConfirmationVisible(false)}
      />
    </View>
  );
}

/* ---------- UpdateModal Component (merged inline) ---------- */
const UpdateModal = ({visible, onClose, item, onUpdate,userId}) => {
  const [actualPrice, setActualPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  useEffect(() => {
    if (item) {
      setActualPrice(item?.actual_price?.toString() || '');
      setSellingPrice(item?.selling_price?.toString() || '');
    }
  }, [item]);

  useEffect(() => {
    if (actualPrice && sellingPrice) {
      const act = parseFloat(actualPrice);
      const sell = parseFloat(sellingPrice);
      const discAmt = act - sell;
      const discPerc = act > 0 ? ((discAmt / act) * 100).toFixed(2) : 0;
      setDiscountAmount(discAmt.toString());
      setDiscountPercent(discPerc.toString());
    } else {
      setDiscountAmount('');
      setDiscountPercent('');
    }
  }, [actualPrice, sellingPrice]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.updateCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>

          <View style={styles.row}>
            <MaterialCommunityIcons
              name="square-circle"
              size={18}
              color={item?.filter_one === 'Veg' ? colors.veg : colors.nonVeg}
              style={{marginRight: 6}}
            />
            <Text style={styles.modalTitle}>
              {item?.item_name || 'Unnamed Item'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Actual Price */}
          <Text style={styles.label}>Actual Price</Text>
          <TextInput
            style={styles.inputBox}
            value={actualPrice}
            keyboardType="numeric"
            onChangeText={setActualPrice}
          />

          {/* Selling Price */}
          <Text style={styles.label}>Selling Price</Text>
          <TextInput
            style={styles.inputBox}
            value={sellingPrice}
            keyboardType="numeric"
            onChangeText={setSellingPrice}
          />

          {/* Discount % (read-only) */}
          <Text style={styles.label}>Discount (%)</Text>
          <TextInput
            style={[styles.inputBox, styles.readOnly]}
            value={discountPercent}
            editable={false}
          />

          {/* Discount Amount (read-only) */}
          <Text style={styles.label}>Discount Amount</Text>
          <TextInput
            style={[styles.inputBox, styles.readOnly]}
            value={discountAmount}
            editable={false}
          />

          <TouchableOpacity
  style={styles.updateBtn}
  onPress={() => {
    onUpdate({
      id: item.id,                 // from products list
      shop_id: userId,             // from vendor login
      item_name: item.item_name,   // keep same name
      actual_price: actualPrice,
      selling_price: sellingPrice,
      discount_percentage: discountPercent,
      discount_amount: discountAmount,
    });
  }}>
  <Text style={styles.updateBtnText}>Update</Text>
</TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 10,
    paddingTop: 25,
  },
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
  price: {fontSize: 14, fontWeight: 'bold', marginRight: 8},

  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 10,
  },
  editBtn: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  editText: {
    color: colors.editBtn,
    fontWeight: '500',
    fontSize: 13,
    marginRight: 3,
  },
  toggleContainer: {
    width: 38,
    height: 19,
    borderRadius: 59,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {backgroundColor: colors.accent},
  toggleOff: {backgroundColor: colors.toggleOff},
  toggleCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: colors.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  actualPrice: {
    fontSize: 13,
    color: colors.grey,
    textDecorationLine: 'line-through',
  },

  /* UpdateModal styles */
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
  readOnly: {
    backgroundColor: colors.black4,
    color: colors.textWhite,
  },
  updateBtn: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 8,
  },
  updateBtnText: {color: colors.white, fontWeight: '500', fontSize: 14},
});
