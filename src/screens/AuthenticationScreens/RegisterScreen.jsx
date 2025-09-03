import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs'; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {fetchLocations} from '../../redux/reducers/auth';
import {fetchCategories} from '../../redux/reducers/auth';
import {fetchSubCategories} from '../../redux/reducers/auth';
import {fetchFilters} from '../../redux/reducers/auth';

import {registerVendor} from '../../redux/reducers/auth';

import LocationModal from '../../components/RegisterScreenLocationModal';
import CategoryModal from '../../components/RegisterScreenCategoryModal';
import SubCategoryModal from '../../components/RegisterScreenSubCategoryModal';
import FilterModal from '../../components/RegisterScreenFilterModal';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

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
  const [loading, setLoading] = useState(false);

  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // modal states
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [isOpenTime, setIsOpenTime] = useState(true);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleFetchLocations = async () => {
      try {
        setLocationLoading(true);
        const response = await dispatch(fetchLocations());
        console.log('fetchLocations response:', response);
        setLocationOptions(response?.payload || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocationOptions([]);
      } finally {
        setLocationLoading(false);
      }
    };

    const handleFetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await dispatch(fetchCategories());
        console.log('fetchCategories response:', response);
        setCategoryOptions(response?.payload || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryOptions([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    handleFetchLocations();
    handleFetchCategories();
  }, [dispatch]);

  const handleConfirmTime = date => {
    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    isOpenTime ? setOpenTime(time) : setCloseTime(time);
    setTimePickerVisible(false);
  };



const pickImage = async (setter) => {
  try {
    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (result.assets?.length > 0) {
      const selectedImage = result.assets[0];
if (selectedImage.fileSize > 2 * 1024 * 1024) {
  Alert.alert('File too large', 'Please select an image under 2MB.');
  return;
}

      // Convert to base64
      const base64Data = await RNFS.readFile(selectedImage.uri, 'base64');
      const base64Image = `data:${selectedImage.type};base64,${base64Data}`;

      setter(base64Image); // ✅ store as Base64 directly
    }
  } catch (error) {
    console.error('Error picking image:', error);
  }
};

  const validateAll = () => {
    const newErrors = {
       location: !location ? 'Location is required' : '',
      category: !category ? 'Category is required' : '',
      subCategory: !subCategory.length ? 'Select at least one subcategory' : '',
      filter: !filter.length ? 'Select at least one filter' : '',
      shopName: !shopName ? 'Shop name is required' : '',
      phone: !/^\d{10}$/.test(phone) ? 'Phone number must be 10 digits' : '',
      password: !password ? 'Password is required' : '',
      email: !email
        ? 'Email is required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? 'Invalid email'
        : '',
      address: !address ? 'Address is required' : '',
      openTime: !openTime ? 'Open time is required' : '',
      closeTime: !closeTime ? 'Close time is required' : '',
      fssai: !fssai ? 'FSSAI number is required' : '',
      license: !license ? 'License number is required' : '',
      pan: !pan ? 'PAN card number is required' : '',
      account: !account
        ? 'Account number is required'
        : !/^\d+$/.test(account)
        ? 'Bank account must be digits only'
        : '',
      gst: !gst ? 'GST number is required' : '',
      shopImage: !shopImage ? 'Shop image is required' : '',
      passbookImage: !passbookImage
        ? 'Passbook / Cheque image is required'
        : '',
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(err => !err);
  };
  const handleSubmit = async () => {
    if (!validateAll()) return;

    if (!selectedLocation) {
      Alert.alert('Please select a location');
      return;
    }

    const payload = {
      location: selectedLocation.id,
      category_id: categoryOptions.find(c => c.name === category)?.id, // send ID instead of name
      subcategory_id: subCategory.map(sc => sc.id).join(','), // send IDs
      name: subCategory.map(sc => sc.name).join(','), // ✅ subcategory names
      filter: filter.map(f => f.id).join(','), // send IDs
      filter_name: filter.map(f => f.name).join(','), // ✅ filter names
      shop_name: shopName,
      phone_number: phone,
      password: password,
      email_id: email,
      shop_address: address,
      open_time: openTime,
      close_time: closeTime,
      shop_fssai_lic: fssai,
      shop_lic: license,
      shop_pancard: pan,
      bankaccount_number: account,
      shop_gst_number: gst,
      shop_img: shopImage,
      passbook: passbookImage,
      table_name: "a",
      sub_category_image:shopImage,
      shopinnerone:"",
      shopinnertwo:"",
      shopinnerthree:"",
      latitude: null,
      longitude: null



    };

    console.log('Submitting payload:', payload);

   try {
  setLoading(true);
  const result = await dispatch(registerVendor(payload)).unwrap();

  Alert.alert('Success', 'Vendor registered successfully!');
  navigation.goBack();
} catch (err) {
  Alert.alert('Failed', err || 'Registration failed. Try again.');
} finally {
  setLoading(false);
}

  };

  // For Subcategories
  const toggleSubCategory = item => {
    setSubCategory(prevSelected => {
      const exists = prevSelected.some(sc => sc.id === item.id);
      if (exists) {
        // remove if already selected
        return prevSelected.filter(sc => sc.id !== item.id);
      } else {
        // add if not selected
        return [...prevSelected, item];
      }
    });
  };

  // For Filters
  const toggleFilter = item => {
    setFilter(prevSelected => {
      const exists = prevSelected.some(f => f.id === item.id);
      if (exists) {
        return prevSelected.filter(f => f.id !== item.id);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register Your Shop</Text>
      </View>

      <Text style={styles.label}>Location</Text>
      <TouchableOpacity
        style={[styles.input, errors.location && styles.errorInput]}
        onPress={() => setLocationModalVisible(true)}
        disabled={locationLoading}>
        {locationLoading ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Text style={location ? styles.timeText : styles.placeholderText}>
            {location || 'Select Location'}
          </Text>
        )}
      </TouchableOpacity>
      {errors.location && (
        <Text style={styles.errorText}>{errors.location}</Text>
      )}

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={[styles.input, errors.category && styles.errorInput]}
        onPress={() => setCategoryModalVisible(true)}>
        <Text style={category ? styles.timeText : styles.placeholderText}>
          {category || 'Select Category'}
        </Text>
      </TouchableOpacity>
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}

      {category ? (
        <>
          <Text style={styles.label}>SubCategory</Text>
          <TouchableOpacity
            style={[styles.input, errors.subCategory && styles.errorInput]}
            onPress={() => setSubCategoryModalVisible(true)}>
            <Text
              style={
                subCategory.length ? styles.timeText : styles.placeholderText
              }>
              {subCategory.map(sc => sc.name).join(', ') ||
                'Select Subcategories'}
            </Text>
          </TouchableOpacity>
          {errors.subCategory && (
            <Text style={styles.errorText}>{errors.subCategory}</Text>
          )}
        </>
      ) : null}

      {category ? (
        <>
          <Text style={styles.label}>Filter</Text>
          <TouchableOpacity
            style={[styles.input, errors.filter && styles.errorInput]}
            onPress={() => setFilterModalVisible(true)}>
            <Text
              style={filter.length ? styles.timeText : styles.placeholderText}>
              {filter.map(f => f.name).join(', ') || 'Select Filters'}
            </Text>
          </TouchableOpacity>
          {errors.filter && (
            <Text style={styles.errorText}>{errors.filter}</Text>
          )}
        </>
      ) : null}

      <TextInput
        style={[styles.input, errors.shopName && styles.errorInput]}
        placeholder="Shop Name"
        value={shopName}
        onChangeText={setShopName}
        placeholderTextColor="#999"
      />
      {errors.shopName && (
        <Text style={styles.errorText}>{errors.shopName}</Text>
      )}

      <TextInput
        style={[styles.input, errors.phone && styles.errorInput]}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#999"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <View
        style={[
          styles.passwordContainer,
          errors.password && styles.errorInput,
        ]}>
        <TextInput
          style={[styles.input2, {flex: 1, marginTop: 0}]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#333"
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TextInput
        style={[styles.input, errors.email && styles.errorInput]}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#999"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.address && styles.errorInput]}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        placeholderTextColor="#999"
      />
      {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

      <TouchableOpacity
        style={[styles.input, errors.openTime && styles.errorInput]}
        onPress={() => {
          setIsOpenTime(true);
          setTimePickerVisible(true);
        }}>
        <Text style={openTime ? styles.timeText : styles.placeholderText}>
          {openTime || 'Shop Open Time'}
        </Text>
      </TouchableOpacity>
      {errors.openTime && (
        <Text style={styles.errorText}>{errors.openTime}</Text>
      )}

      <TouchableOpacity
        style={[styles.input, errors.closeTime && styles.errorInput]}
        onPress={() => {
          setIsOpenTime(false);
          setTimePickerVisible(true);
        }}>
        <Text style={closeTime ? styles.timeText : styles.placeholderText}>
          {closeTime || 'Shop Close Time'}
        </Text>
      </TouchableOpacity>
      {errors.closeTime && (
        <Text style={styles.errorText}>{errors.closeTime}</Text>
      )}

      <DateTimePickerModal
        isVisible={timePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisible(false)}
      />

      <TextInput
        style={[styles.input, errors.fssai && styles.errorInput]}
        placeholder="FSSAI Licence Number"
        value={fssai}
        onChangeText={setFssai}
        placeholderTextColor="#999"
      />
      {errors.fssai && <Text style={styles.errorText}>{errors.fssai}</Text>}

      <TextInput
        style={[styles.input, errors.license && styles.errorInput]}
        placeholder="Shop License Number"
        value={license}
        onChangeText={setLicense}
        placeholderTextColor="#999"
      />
      {errors.license && <Text style={styles.errorText}>{errors.license}</Text>}

      <TextInput
        style={[styles.input, errors.pan && styles.errorInput]}
        placeholder="Pan Card Number"
        value={pan}
        onChangeText={setPan}
        placeholderTextColor="#999"
      />
      {errors.pan && <Text style={styles.errorText}>{errors.pan}</Text>}

      <TextInput
        style={[styles.input, errors.account && styles.errorInput]}
        placeholder="Bank Account Number"
        keyboardType="number-pad"
        value={account}
        onChangeText={setAccount}
        placeholderTextColor="#999"
      />
      {errors.account && <Text style={styles.errorText}>{errors.account}</Text>}

      <TextInput
        style={[styles.input, errors.gst && styles.errorInput]}
        placeholder="GSTIN"
        value={gst}
        onChangeText={setGst}
        placeholderTextColor="#999"
      />
      {errors.gst && <Text style={styles.errorText}>{errors.gst}</Text>}

      <Text style={styles.label}>Shop Image</Text>
      <TouchableOpacity
        style={[styles.imageBox, errors.shopImage && {borderColor: 'red'}]}
        onPress={() => pickImage(setShopImage)}>
        {shopImage ? (
          <Image source={{uri: shopImage}} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>+ Upload Shop Image</Text>
        )}
      </TouchableOpacity>
      {errors.shopImage && (
        <Text style={styles.errorText}>{errors.shopImage}</Text>
      )}

      <Text style={styles.label}>Pass Book / Cheque Image</Text>
      <TouchableOpacity
        style={[styles.imageBox, errors.passbookImage && {borderColor: 'red'}]}
        onPress={() => pickImage(setPassbookImage)}>
        {passbookImage ? (
          <Image source={{uri: passbookImage}} style={styles.image} />
        ) : (
          <Text style={styles.placeholderText}>+ Upload Passbook</Text>
        )}
      </TouchableOpacity>
      {errors.passbookImage && (
        <Text style={styles.errorText}>{errors.passbookImage}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SUBMIT</Text>
        )}
      </TouchableOpacity>

      <LocationModal
        visible={locationModalVisible}
        locations={locationOptions}
        selectedLocation={selectedLocation} // ✅ pass object
        onSelect={item => {
          setSelectedLocation(item); // ✅ store entire object
          setLocation(item.name); // ✅ still show name in UI
          setLocationModalVisible(false); // ✅ close modal after selection
        }}
        onClose={() => setLocationModalVisible(false)}
      />

      <CategoryModal
        visible={categoryModalVisible}
        categories={categoryOptions}
        selectedCategory={category}
        onSelect={async item => {
          setCategory(item.name); // selected category name
          setSubCategory([]); // reset previously selected subcategories
          setFilter([]);
          setCategoryModalVisible(false);

          try {
            setSubCategoryLoading(true);
            const subCatResponse = await dispatch(fetchSubCategories(item.id));
            setSubCategoryOptions(subCatResponse?.payload || []);

            setFilterLoading(true);
            const filterResponse = await dispatch(fetchFilters(item.id));
            setFilterOptions(filterResponse?.payload || []);
          } finally {
            setSubCategoryLoading(false);
            setFilterLoading(false);
          }
        }}
        onClose={() => setCategoryModalVisible(false)}
      />

      <SubCategoryModal
        visible={subCategoryModalVisible}
        subCategories={subCategoryOptions}
        selected={subCategory}
        onToggle={toggleSubCategory}
        loading={subCategoryLoading}
        onClose={() => setSubCategoryModalVisible(false)}
      />

      <FilterModal
        visible={filterModalVisible}
        filters={filterOptions}
        selected={filter}
        loading={filterLoading}
        onToggle={toggleFilter}
        onClose={() => setFilterModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingTop: 30},
  scrollContent: {padding: 18, paddingBottom: 40},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  heading: {fontSize: 22, fontWeight: '700', marginLeft: 12, color: '#222'},
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 14,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    marginBottom: 10,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  input2: {fontSize: 14, color: '#000', padding: 12},
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  timeText: {color: '#000', fontSize: 14},
  placeholderText: {color: '#999', fontSize: 14},
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  errorInput: {borderColor: 'red'},
  errorText: {color: 'red', fontSize: 12, marginBottom: 6},
  imageBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  image: {width: '100%', height: '100%', resizeMode: 'cover'},
});
