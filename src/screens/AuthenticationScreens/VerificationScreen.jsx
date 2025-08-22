import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
//import { colors } from "../config/theme";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OtpScreen = ({navigation}) => {
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text) || text === '') {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text !== '' && index < 3) {
        inputsRef.current[index + 1].focus();
      }
    }
  };
  const handleKeyPress = ({nativeEvent}, index) => {
    if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };
  const handleVerify = () => {
    setSubmitted(true);
    const otpValue = otp.join('');
    if (otpValue.length < 4 || otp.includes('')) {
      console.log('Incomplete OTP');
      return;
    }
    console.log('Entered OTP:', otpValue);
    // Add your verify logic here
    navigation.navigate('BottomTabNavigation');
  };

  return (
    <KeyboardAvoidingView style={{backgroundColor: '#fff', flex: 1}}>
      <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
        <ImageBackground
          source={require('../../assets/Ellipse.png')}
          style={styles.background}
          resizeMode="stretch">
          {' '}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={{marginRight: 20}}>
                  <MaterialIcons
                    style={styles.Arrow}
                    name="keyboard-arrow-left"
                    size={30}
                    color="#ffffffff"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.Top}>
                <Text style={styles.title}>
                  "The Fastest Route to Your{'\n'}{' '}
                  <Text style={styles.boldText}>Favorite Food!"</Text>
                </Text>
              </View>
              <Image
                source={require('../../assets/OTP.png')}
                style={styles.image}
              />
            </View>
          </TouchableWithoutFeedback>
        </ImageBackground>
        <View style={styles.otpText}>
          <Text style={styles.label}>Verification Code</Text>
          <Text style={styles.subText}>
            We have sent the verification code to your Phone Number.
          </Text>
          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => (inputsRef.current[index] = el)}
                style={[
                  styles.otpBox,
                  submitted && otp[index] === '' && styles.otpError,
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={otp[index]}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>
          <Text style={styles.resend}>
            Didnt't recieve the OTP?
            <Text
              onPress={() => navigation.navigate('SignInScreen')}
              style={styles.resendOtp}>
              {' '}
              Resend OTP
            </Text>
          </Text>
          <View style={styles.Bottom}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('BottomTabNavigation')}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  Arrow: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  Top: {
    top: 30,
  },
  Bottom: {
    paddingTop: 90,
    padding: 10,
  },
  image: {
    width: '90%',
    height: 250,
    alignSelf: 'center',
    transform: [{translateY: 50}],
    resizeMode: 'contain',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  boldText: {
    fontWeight: '500',
    color: '#1A43BF',
  },
  otpText: {
    padding: 10,
    marginTop: 40,
  },
  label: {
    color: '#1A43BF',
    fontSize: 18,
    marginBottom: 5,
    alignSelf: 'center',
    marginTop: 10,
    fontWeight: 500,
  },

  subText: {
    color: '#00000099',
    //textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 25,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    marginTop: 10,
    padding: 10,
  },
  otpBox: {
    width: 52,
    height: 52,
    borderWidth: 1.2,
    borderColor: 'lightGray',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
  },
  activeInput: {
    color: 'lightGray',
  },
  otpError: {
    color: 'lightGray',
  },
  resend: {
    alignSelf: 'center',
    color: '#00000099',
    fontSize:12
  },
  resendOtp: {
    color: '#1A43BF',
   // fontFamily: '700',
    fontSize: 12
  },
  button: {
    backgroundColor: '#1A43BF',
    padding: 15,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize:15
  },
});
export default OtpScreen;
