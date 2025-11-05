// src/screens/MenuScreen.jsx
import React, {useState, useEffect, useCallback} from 'react';
import NoInternetScreen from '../components/NoInternetScreen';

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
import {
  fetchShopDetails,
  fetchProductsList,
  updateProduct,
  updateProductStatus,
} from '../redux/reducers/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';
import {RestaurantLogo} from '../assets/index';
import ConfirmationModal from '../components/ConfirmationModal';
import NetInfo from '@react-native-community/netinfo';

const CustomToggle = ({value, onChange}) => {
  // keep Animated.Value stable across renders
  const translateRef = React.useRef(new Animated.Value(value ? 19 : 0));

  // animate only when `value` changes
  React.useEffect(() => {
    Animated.timing(translateRef.current, {
      toValue: value ? 19 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  // call parent handler (which now opens confirmation modal)
  return (
    <TouchableOpacity
      style={[
        styles.toggleContainer,
        value ? styles.toggleOn : styles.toggleOff,
      ]}
      activeOpacity={0.8}
      onPress={() => onChange(!value)} // keep your existing prop name
    >
      <Animated.View
        style={[
          styles.toggleCircle,
          {transform: [{translateX: translateRef.current}]},
        ]}
      />
    </TouchableOpacity>
  );
};

export default function MenuScreen() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  const {userId, shopDetails, products, loading} = useSelector(
    state => state.Auth,
  );

  const [toggles, setToggles] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  // 🔹 toggle confirmation modal state
  const [toggleConfirmVisible, setToggleConfirmVisible] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(null);

  // Refetch products when internet comes back
  useEffect(() => {
    if (isConnected && userId) {
      dispatch(fetchShopDetails(userId));
      dispatch(fetchProductsList(userId));
    }
  }, [isConnected, userId, dispatch]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

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
        initialToggles[item.id] = item.active_status === '0';
      });
      setToggles(initialToggles);
    }
  }, [products]);

  // 🔹 Group products by sub_category_id
  // Filter products by name
  const filteredProducts = products.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group filtered products by sub_category_id
  const groupedProducts = filteredProducts.reduce((acc, item) => {
    if (!acc[item.sub_category_id]) {
      acc[item.sub_category_id] = {
        title: item.sub_category_name,
        data: [],
      };
    }
    acc[item.sub_category_id].data.push(item);
    return acc;
  }, {});

  // 🔹 show toggle confirmation instead of direct update
  const handleToggle = (id, newValue) => {
    setPendingToggle({id, newValue});
    setToggleConfirmVisible(true);
  };

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const {id, newValue} = pendingToggle;

    setToggleConfirmVisible(false); // close first
    setToggles(prev => ({...prev, [id]: newValue}));

    const active_status = newValue ? '0' : '1';
    dispatch(updateProductStatus({id, shop_id: userId, active_status}))
      .unwrap()
      .catch(err => console.error('Status update failed:', err));
  };

  const cancelToggle = () => {
    setPendingToggle(null);
    setToggleConfirmVisible(false);
  };

  const openEditCard = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleUpdate = updatedValues => {
    setModalVisible(false); // close immediately
    dispatch(updateProduct({...updatedValues, shop_id: userId}))
      .unwrap()
      .then(() => console.log('Product updated successfully'))
      .catch(err => console.error('Update failed:', err));
  };

  useEffect(() => {
    if (confirmationVisible) {
      const timer = setTimeout(() => {
        setConfirmationVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationVisible]);

  const renderCard = useCallback(
    ({item}) => (
      <View style={styles.card}>
        {item.item_image ? (
          <Image
            source={{uri: item.item_image}}
            style={styles.foodImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.foodImage,
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#eee',
              },
            ]}>
            <Text style={{color: '#888', fontSize: 12, textAlign: 'center'}}>
              Image Not Available
            </Text>
          </View>
        )}

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
            <Text style={styles.price}>₹{item.selling_price}</Text>
            {item.actual_price &&
              parseFloat(item.actual_price) >
                parseFloat(item.selling_price) && (
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
              color="#fff" // icon white to match button
            />
          </TouchableOpacity>
        </View>
      </View>
    ),

    [toggles],
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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 🔹 Menu Lists from API */}
  <ScrollView>
  {!isConnected ? (
    // Case 1: No internet
    <NoInternetScreen
      onRetry={() => {
        if (userId) {
          dispatch(fetchShopDetails(userId));
          dispatch(fetchProductsList(userId));
        }
      }}
    />
  ) : loading ? (
    // Optional: Loading indicator
    <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
      Loading menu items...
    </Text>
  ) : Object.keys(groupedProducts).length === 0 ? (
    // Case 2: Internet available but no items
    <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
      No menu items available
    </Text>
  ) : (
    // Case 3: Items available
    Object.values(groupedProducts).map(section => (
      <View key={section.title}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <FlatList
          data={section.data}
          renderItem={renderCard}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    ))
  )}
</ScrollView>


      {/* 🔹 Update Modal */}
      {modalVisible && (
        <UpdateModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          item={selectedItem}
          onUpdate={handleUpdate}
          userId={userId}
        />
      )}

      {/* 🔹 Success Confirmation */}
      {confirmationVisible && (
        <ConfirmationModal
          visible={confirmationVisible}
          onClose={() => setConfirmationVisible(false)}
        />
      )}

      {/* 🔹 Toggle Confirmation Modal */}
      <Modal
        visible={toggleConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelToggle}>
        <View style={styles.overlay}>
          <View style={styles.updateCard}>
            <Text style={{fontSize: 15, fontWeight: '500', marginBottom: 15}}>
              {pendingToggle?.newValue
                ? 'Do you want to make this item available?'
                : 'Do you want to remove this item from menu?'}
            </Text>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  {backgroundColor: colors.danger, flex: 1, marginRight: 8},
                ]}
                onPress={cancelToggle}>
                <Text style={styles.updateBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  {backgroundColor: colors.success, flex: 1},
                ]}
                onPress={confirmToggle}>
                <Text style={styles.updateBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const UpdateModal = ({visible, onClose, item, onUpdate, userId}) => {
  const [actualPrice, setActualPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

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

  const handleConfirmUpdate = () => {
    onUpdate({
      id: item.id,
      shop_id: userId,
      item_name: item.item_name,
      actual_price: actualPrice,
      selling_price: sellingPrice,
      discount_percentage: discountPercent,
      discount_amount: discountAmount,
    });
    setConfirmVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.updateCard}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
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

          {/* Discount % */}
          <Text style={styles.label}>Discount (%)</Text>
          <TextInput
            style={[styles.inputBox, styles.readOnly]}
            value={discountPercent}
            editable={false}
          />

          {/* Discount Amount */}
          <Text style={styles.label}>Discount Amount</Text>
          <TextInput
            style={[styles.inputBox, styles.readOnly]}
            value={discountAmount}
            editable={false}
          />

          {/* Update button */}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => setConfirmVisible(true)}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Confirmation Popup */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.updateCard}>
            <Text style={{fontSize: 15, fontWeight: '500', marginBottom: 15}}>
              Are you sure you want to update this product?
            </Text>

            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  {backgroundColor: colors.danger, flex: 1, marginRight: 8},
                ]}
                onPress={() => setConfirmVisible(false)}>
                <Text style={styles.updateBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  {backgroundColor: colors.success, flex: 1},
                ]}
                onPress={handleConfirmUpdate}>
                <Text style={styles.updateBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  icon: {marginRight: 5},
  input: {flex: 1, fontSize: 16, color: colors.textDark},
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },

  toggleContainer: {
    width: 38,
    height: 19,
    borderRadius: 59,
    padding: 2,
    justifyContent: 'center',
    marginLeft: 10,
  },
  toggleOn: {backgroundColor: 'green'},
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

  /* Modal styles */
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
  modalTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A43BF',
    marginRight: 30,
  },
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
