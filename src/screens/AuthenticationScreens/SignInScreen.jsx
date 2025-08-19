import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import AppNavigation from '../../navigation/AppNavigation';
export default function SignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState('9988776655');
  const [rememberMe, setRememberMe] = useState(true);

  const validatePhoneNumber = number => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const handleSignIn = ({navigation}) => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit number',
      );
      return;
    }
    navigation.navigate('VerificationScreen');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/AppLogo.png')} // Replace with your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>SIGN IN</Text>
      <Text style={styles.subtitle}>Only for Restaurant owner</Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Phone Number"
          keyboardType="number-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={text => {
            // Allow only digits
            const filtered = text.replace(/[^0-9]/g, '');
            setPhoneNumber(filtered);
          }}
        />
      </View>

      {/* Remember Me */}
      <View style={styles.rememberContainer}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{false: '#ccc', true: '#ccc'}}
          thumbColor={rememberMe ? '#1849C6' : '#f4f3f4'}
        />
        <Text style={styles.rememberText}>Remember me</Text>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#DCE4FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 9,
  },
  subtitle: {
    fontSize: 12,
    color: '#1A43BF',
    marginBottom: 40,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: '#5B616E',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#0000001A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#1A1A1A99',
  },
  signInButton: {
    backgroundColor: '#1A43BF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
