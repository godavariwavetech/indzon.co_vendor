import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker'; // 📦 npm install react-native-image-picker
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../config/theme';
import CustomAlertModal from '../../components/CustomAlertModal';

const EditProfileScreen = ({navigation}) => {
  const [name, setName] = useState('Add Your Restaurant Name');
  const [address, setAddress] = useState('123 Main Street, Rajahmundry, India');
  const [timing, setTiming] = useState('Mon - Sun | 10:00 AM - 11:00 PM');
  const [mobile, setMobile] = useState('9876543210');
  const [email, setEmail] = useState('addyouremail@gmail.com');
  const [profileImage, setProfileImage] = useState(null);

  // ✅ Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error');

  const showModal = (title, message, type = 'error') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  // 📸 Pick image from local storage
  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && response.assets) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  // ✅ Validations
  const validateAndSave = () => {
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(mobile.replace(/\D/g, ''))) {
      showModal('Invalid Mobile', 'Enter a valid 10-digit mobile number');
      return;
    }
    if (!emailRegex.test(email)) {
      showModal('Invalid Email', 'Enter a valid email address');
      return;
    }

    showModal('Profile Updated', 'Your changes have been saved.');
    navigation.goBack(); // 🔙 return to profile screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.imagePicker}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../../assets/AppLogo.png')
            }
            style={styles.image}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.changeText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Restaurant Name"
      />
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
      />
      <TextInput
        style={styles.input}
        value={timing}
        onChangeText={setTiming}
        placeholder="Timing"
      />
      <TextInput
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
        placeholder="Mobile"
        keyboardType="phone-pad"
        maxLength={10} // ✅ restrict to 10 digits
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.saveButton} onPress={validateAndSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
      <CustomAlertModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 20,
  },
  backButton: {
    marginVertical: 20,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.brandPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.brandPrimary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: colors.buttonTextLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
