import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../config/theme';
import {appLogo} from '../../assets/index';
import {useDispatch} from 'react-redux';
import {vendorLogin, updateFCMToken} from '../../redux/reducers/auth';
import {retrieveFCMToken} from '../../services/NotificationsService';
import CustomAlertModal from '../../components/CustomAlertModal'; // ✅ Import
import validateLogin from '../../utils/validateLogin';

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSignIn = async () => {
    const validationError = validateLogin(phoneNumber, password);
    if (validationError) {
      showModal(validationError.title, validationError.message);
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(vendorLogin({phoneNumber, password}));
      // console.log('Login API response:', response);

      if (response?.payload?.status === 200 && response.payload?.data?.[0]?.id) {
        // const successMessage = response?.payload?.msg || 'Login Successful';
        // showModal('Success', successMessage, 'success');

        // Update FCM Token
        try {
          const token = await retrieveFCMToken();
          console.log('FCM Token signin screen:', token);
          console.log('User ID signin screen:', response.payload?.data?.id);
          if (token && response.payload?.data?.[0]?.id) {
            dispatch(
              updateFCMToken({
                userId: response.payload.data[0].id,
                fcmToken: token,
              }),
            );
          }
        } catch (err) {
          console.error('Failed to update FCM token', err);
        }

        setTimeout(() => {
          setModalVisible(false);

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'BottomTabNavigation'}],
            }),
          );
          // navigation.navigate('BottomTabNavigation');
        }, 1200);
      } else {
        const errorMessage =
          response?.payload?.msg ||
          response?.error?.message ||
          'Login failed. Please try again.';
        showModal('Login Failed', errorMessage);
      }
    } catch (error) {
      console.error('Login API Error:', error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          showModal(
            'Unauthorized',
            error.response.data?.msg || 'Invalid credentials.',
          );
        } else if (status >= 500) {
          showModal('Server Error', 'Please try again later.');
        } else {
          showModal(
            'Error',
            error.response.data?.msg || 'Something went wrong.',
          );
        }
      } else if (error.request) {
        showModal(
          'Network Error',
          'Unable to reach server. Please check your internet.',
        );
      } else {
        showModal('Error', error.message || 'Unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View>
            <View style={styles.logoContainer}>
              <Image
                source={appLogo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>SIGN IN</Text>
            <Text style={styles.subtitle}>Welcome to Indzon.co</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter Your Phone Number</Text>
              <TextInput
                style={[styles.input, {color: colors.textDark}]}
                placeholder="Enter your Phone Number"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={text =>
                  setPhoneNumber(text.replace(/[^0-9]/g, ''))
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter Your Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.passwordInput, {color: colors.textDark}]}
                  placeholder="Enter your Password"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password link */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ChangeForgotPassword')}
                style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register SignUp */}
            {/* <View style={styles.Register}>
              <Text style={styles.signText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.sigupText}>SignUp</Text>
              </TouchableOpacity>
            </View>  */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ✅ Reusable Custom Modal */}
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
  container: {paddingHorizontal: 18, backgroundColor: '#fff', flex: 1},
  logoContainer: {marginTop: 60, alignItems: 'center'},
  logo: {width: 150, height: 150},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginTop: 10,
    marginBottom: 9,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 40,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {width: '100%', marginBottom: 20},
  label: {fontSize: 15, color: colors.textLight, marginBottom: 8},
  input: {
    borderWidth: 1,
    borderColor: colors.textLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textLight,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
  },
  passwordInput: {flex: 1, fontSize: 16, paddingVertical: 10},
  eyeIcon: {paddingHorizontal: 8},
  forgotPasswordContainer: {marginTop: 8, alignItems: 'flex-end'},
  forgotPasswordText: {color: colors.primary, fontSize: 14, fontWeight: '600'},
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInText: {color: colors.white, fontSize: 16, fontWeight: '600'},
  Register: {flexDirection: 'row', justifyContent: 'center', marginTop: 15},
  signText: {fontSize: 16, fontWeight: '400'},
  sigupText: {fontSize: 16, fontWeight: '700', color: colors.primary},
});
