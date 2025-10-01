import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import CustomAlertModal from '../../components/CustomAlertModal';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../config/theme';
import {useDispatch} from 'react-redux';
import {verifyNumber, changePassword} from '../../redux/reducers/auth';

export default function ChangeForgotPassword() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

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


  // 👁 Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePhoneNumber = number => /^[0-9]{10}$/.test(number);

  /** STEP 1: Verify Number */
  const handleVerify = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showModal(
        'Invalid Phone Number',
        'Please enter a valid 10-digit number',
      );
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(verifyNumber({phoneNumber}));
      console.log('Verify API response:', response);

      if (response?.payload?.status === 200) {
        const data = response?.payload?.data;

        if (data && data.length > 0) {
          showModal('Success', 'Phone number verified.');
          setIsVerified(true); // ✅ Only after success
        } else {
          showModal(
            'Not Registered',
            'This phone number is not registered with us.',
          );
        }
      } else {
        const errorMessage =
          response?.payload?.msg ||
          response?.error?.message ||
          'Verification failed. Please try again.';
        showModal('Verification Failed', errorMessage);
      }
    } catch (error) {
     showModal('Error', 'Verification failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** STEP 2: Change Password */
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
    showModal('Error', 'Please fill out both fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
  showModal('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(
        changePassword({phoneNumber, newPassword}),
      );
      console.log('Change Password API response:', response);

      if (response?.payload?.status === 200) {
        showModal('Success', 'Password changed successfully!');
        navigation.goBack();
      } else {
        const errorMessage =
          response?.payload?.msg ||
          response?.error?.message ||
          'Password change failed.';
       showModal('Failed', errorMessage);
      }
    } catch (error) {
     showModal('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerTitle}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{}}>
          <MaterialIcons
            style={styles.Arrow}
            name="arrow-back"
            size={25}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.header}>Change Password</Text>
      </View>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          {/* Content */}
          <View style={styles.content}>
            {/* ✅ Show subtitle only if not verified */}
            {!isVerified && (
              <Text style={styles.subtitle}>
                Please enter your registered phone number to verify your
                account.
              </Text>
            )}

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, {color: colors.textDark}]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                editable={!isVerified}
                onChangeText={text => {
                  const filtered = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(filtered);
                }}
              />
            </View>

            {/* Show Password Fields ONLY after verification */}
            {isVerified && (
              <>
                {/* New Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, {flex: 1, color: colors.textDark}]}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.textLight}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}>
                      <Icon
                        name={showNewPassword ? 'eye-off' : 'eye'}
                        size={22}
                        color={colors.textLight}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, {flex: 1, color: colors.textDark}]}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textLight}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}>
                      <Icon
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={22}
                        color={colors.textLight}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && {opacity: 0.7}]}
              onPress={isVerified ? handleChangePassword : handleVerify}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.verifyText}>
                  {isVerified ? 'Change Password' : 'Verify'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlertModal
  visible={modalVisible}
  title={modalTitle}
  message={modalMessage}
  type={modalType}
  onClose={() => setModalVisible(false)}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerTitle: {
    flexDirection: 'row',
    paddingTop: 45,
    //backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: 18,
    marginBottom: 10,
    paddingLeft: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 18,
  },
  subtitle: {
    fontSize: 15,
    color: colors.darkGray,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.background,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 15,
  },
  verifyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
