// ✅ UPDATED RegisterScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

import LocationModal from '../../components/RegisterScreenLocationModal';
import CategoryModal from '../../components/RegisterScreenCategoryModal';
import SubCategoryModal from '../../components/RegisterScreenSubCategoryModal';
import FilterModal from '../../components/RegisterScreenFilterModal';

export default function RegisterScreen() {
  const navigation = useNavigation();

  // form states
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState([]);
  const [filter, setFilter] = useState([]);
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [fssai, setFssai] = useState('');
  const [license, setLicense] = useState('');
  const [pan, setPan] = useState('');
  const [account, setAccount] = useState('');
  const [gst, setGst] = useState('');
  const [shopImage, setShopImage] = useState(null);
  const [passbookImage, setPassbookImage] = useState(null);

  // modal states
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [isOpenTime, setIsOpenTime] = useState(true);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // errors
  const [errors, setErrors] = useState({});

  const categoryData = {
    Food: {
      subCategories: ['Biryani', 'Curries', 'Desserts', 'Fried Rice', 'Noodles', 'Soup'],
      filters: ['Veg', 'Non Veg'],
    },
    Grocery: {
      subCategories: ['Dairy & Eggs', 'Oils', 'Rice & Grains', 'Snacks'],
      filters: ['Organic', 'Non-Organic'],
    },
    Meat: {
      subCategories: ['Chicken', 'Mutton', 'Fish'],
      filters: ['Fresh', 'Frozen'],
    },
  };

  const locationOptions = ['Rajahmundry', 'Kakinada', 'Vijayawada', 'Visakapatnam'];

  const handleConfirmTime = date => {
    const time = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: true});
    isOpenTime ? setOpenTime(time) : setCloseTime(time);
    setTimePickerVisible(false);
  };

  const pickImage = async setter => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets?.length > 0) setter(result.assets[0].uri);
  };

  // ✅ Validate everything (now every field is mandatory)
  const validateAll = () => {
    const newErrors = {
      location: !location ? 'Location is required' : '',
      category: !category ? 'Category is required' : '',
      subCategory: !subCategory.length ? 'Select at least one subcategory' : '',
      filter: !filter.length ? 'Select at least one filter' : '',
      shopName: !shopName ? 'Shop name is required' : '',
      phone: !/^\d{10}$/.test(phone) ? 'Phone number must be 10 digits' : '',
      password: !password ? 'Password is required' : '',
      email: !email ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email' : '',
      address: !address ? 'Address is required' : '',
      openTime: !openTime ? 'Open time is required' : '',
      closeTime: !closeTime ? 'Close time is required' : '',
      fssai: !fssai ? 'FSSAI number is required' : '',
      license: !license ? 'License number is required' : '',
      pan: !pan ? 'PAN card number is required' : '',
      account: !account ? 'Account number is required' : !/^\d+$/.test(account) ? 'Bank account must be digits only' : '',
      gst: !gst ? 'GST number is required' : '',
      shopImage: !shopImage ? 'Shop image is required' : '',
      passbookImage: !passbookImage ? 'Passbook / Cheque image is required' : '',
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(err => !err);
  };

  const handleSubmit = () => {
    if (validateAll()) {
      console.log('✅ All fields filled, form submitted');
      // Call API here
    }
  };

  const toggleSubCategory = item =>
    setSubCategory(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  const toggleFilter = item =>
    setFilter(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register Your Shop</Text>
      </View>

      {/* LOCATION */}
      <Text style={styles.label}>Location</Text>
      <TouchableOpacity style={[styles.input, errors.location && styles.errorInput]} onPress={() => setLocationModalVisible(true)}>
        <Text style={location ? styles.timeText : styles.placeholderText}>{location || 'Select Location'}</Text>
      </TouchableOpacity>
      {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

      {/* CATEGORY */}
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={[styles.input, errors.category && styles.errorInput]} onPress={() => setCategoryModalVisible(true)}>
        <Text style={category ? styles.timeText : styles.placeholderText}>{category || 'Select Category'}</Text>
      </TouchableOpacity>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

      {/* SUBCATEGORY */}
      {category ? (
        <>
          <Text style={styles.label}>SubCategory</Text>
          <TouchableOpacity style={[styles.input, errors.subCategory && styles.errorInput]} onPress={() => setSubCategoryModalVisible(true)}>
            <Text style={subCategory.length ? styles.timeText : styles.placeholderText}>
              {subCategory.length ? subCategory.join(', ') : 'Select SubCategories'}
            </Text>
          </TouchableOpacity>
          {errors.subCategory && <Text style={styles.errorText}>{errors.subCategory}</Text>}
        </>
      ) : null}

      {/* FILTER */}
      {category ? (
        <>
          <Text style={styles.label}>Filter</Text>
          <TouchableOpacity style={[styles.input, errors.filter && styles.errorInput]} onPress={() => setFilterModalVisible(true)}>
            <Text style={filter.length ? styles.timeText : styles.placeholderText}>
              {filter.length ? filter.join(', ') : 'Select Filters'}
            </Text>
          </TouchableOpacity>
          {errors.filter && <Text style={styles.errorText}>{errors.filter}</Text>}
        </>
      ) : null}

      {/* TEXT INPUTS */}
      <TextInput style={[styles.input, errors.shopName && styles.errorInput]} placeholder="Shop Name" value={shopName} onChangeText={setShopName} placeholderTextColor="#999" />
      {errors.shopName && <Text style={styles.errorText}>{errors.shopName}</Text>}

      <TextInput style={[styles.input, errors.phone && styles.errorInput]} placeholder="Phone Number" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} placeholderTextColor="#999" />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <View style={[styles.passwordContainer, errors.password && styles.errorInput]}>
        <TextInput style={[styles.input2, {flex: 1, marginTop: 0}]} placeholder="Password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} placeholderTextColor="#999" />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput style={[styles.input, errors.email && styles.errorInput]} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="#999" />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput style={[styles.input, errors.address && styles.errorInput]} placeholder="Address" value={address} onChangeText={setAddress} placeholderTextColor="#999" />
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      {/* SHOP TIMINGS */}
      <TouchableOpacity style={[styles.input, errors.openTime && styles.errorInput]} onPress={() => {setIsOpenTime(true); setTimePickerVisible(true);}}>
        <Text style={openTime ? styles.timeText : styles.placeholderText}>{openTime || 'Shop Open Time'}</Text>
      </TouchableOpacity>
      {errors.openTime && <Text style={styles.errorText}>{errors.openTime}</Text>}

      <TouchableOpacity style={[styles.input, errors.closeTime && styles.errorInput]} onPress={() => {setIsOpenTime(false); setTimePickerVisible(true);}}>
        <Text style={closeTime ? styles.timeText : styles.placeholderText}>{closeTime || 'Shop Close Time'}</Text>
      </TouchableOpacity>
      {errors.closeTime && <Text style={styles.errorText}>{errors.closeTime}</Text>}

      <DateTimePickerModal isVisible={timePickerVisible} mode="time" onConfirm={handleConfirmTime} onCancel={() => setTimePickerVisible(false)} />

      {/* OTHER INPUTS (NOW MANDATORY) */}
      <TextInput style={[styles.input, errors.fssai && styles.errorInput]} placeholder="FSSAI Licence Number" value={fssai} onChangeText={setFssai} placeholderTextColor="#999" />
      {errors.fssai && <Text style={styles.errorText}>{errors.fssai}</Text>}

      <TextInput style={[styles.input, errors.license && styles.errorInput]} placeholder="Shop License Number" value={license} onChangeText={setLicense} placeholderTextColor="#999" />
      {errors.license && <Text style={styles.errorText}>{errors.license}</Text>}

      <TextInput style={[styles.input, errors.pan && styles.errorInput]} placeholder="Pan Card Number" value={pan} onChangeText={setPan} placeholderTextColor="#999" />
      {errors.pan && <Text style={styles.errorText}>{errors.pan}</Text>}

      <TextInput style={[styles.input, errors.account && styles.errorInput]} placeholder="Bank Account Number" keyboardType="number-pad" value={account} onChangeText={setAccount} placeholderTextColor="#999" />
      {errors.account && <Text style={styles.errorText}>{errors.account}</Text>}

      <TextInput style={[styles.input, errors.gst && styles.errorInput]} placeholder="GSTIN" value={gst} onChangeText={setGst} placeholderTextColor="#999" />
      {errors.gst && <Text style={styles.errorText}>{errors.gst}</Text>}

      {/* IMAGES */}
      <Text style={styles.label}>Shop Image</Text>
      <TouchableOpacity style={[styles.imageBox, errors.shopImage && {borderColor: 'red'}]} onPress={() => pickImage(setShopImage)}>
        {shopImage ? <Image source={{uri: shopImage}} style={styles.image} /> : <Text style={styles.placeholderText}>+ Upload Shop Image</Text>}
      </TouchableOpacity>
      {errors.shopImage && <Text style={styles.errorText}>{errors.shopImage}</Text>}

      <Text style={styles.label}>Pass Book / Cheque Image</Text>
      <TouchableOpacity style={[styles.imageBox, errors.passbookImage && {borderColor: 'red'}]} onPress={() => pickImage(setPassbookImage)}>
        {passbookImage ? <Image source={{uri: passbookImage}} style={styles.image} /> : <Text style={styles.placeholderText}>+ Upload Passbook</Text>}
      </TouchableOpacity>
      {errors.passbookImage && <Text style={styles.errorText}>{errors.passbookImage}</Text>}

      {/* SUBMIT BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>

      {/* MODALS */}
      <LocationModal visible={locationModalVisible} locations={locationOptions} selectedLocation={location} onSelect={setLocation} onClose={() => setLocationModalVisible(false)} />
      <CategoryModal visible={categoryModalVisible} categories={Object.keys(categoryData)} selectedCategory={category} onSelect={item => {setCategory(item); setSubCategory([]); setFilter([]);}} onClose={() => setCategoryModalVisible(false)} />
      <SubCategoryModal visible={subCategoryModalVisible} subCategories={categoryData[category]?.subCategories || []} selected={subCategory} onToggle={toggleSubCategory} onClose={() => setSubCategoryModalVisible(false)} />
      <FilterModal visible={filterModalVisible} filters={categoryData[category]?.filters || []} selected={filter} onToggle={toggleFilter} onClose={() => setFilterModalVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingTop: 35},
  scrollContent: {padding: 16, paddingBottom: 40},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  heading: {fontSize: 22, fontWeight: '700', marginLeft: 12, color: '#222'},
  label: {fontSize: 14, fontWeight: '500', marginTop: 14, marginBottom: 6, color: '#333'},
  input: {borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 14, marginBottom: 10, color: '#000', backgroundColor: '#fafafa'},
  input2: {fontSize: 14, color: '#000', padding: 12},
  passwordContainer: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, backgroundColor: '#fafafa'},
  timeText: {color: '#000', fontSize: 14},
  placeholderText: {color: '#999', fontSize: 14},
  button: {backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 10, marginTop: 25, marginBottom: 50, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 2}, shadowRadius: 4, elevation: 3},
  buttonText: {color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center'},
  errorInput: {borderColor: 'red'},
  errorText: {color: 'red', fontSize: 12, marginBottom: 6},
  imageBox: {borderWidth: 1, borderColor: '#ccc', borderRadius: 10, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', backgroundColor: '#fafafa'},
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
});
