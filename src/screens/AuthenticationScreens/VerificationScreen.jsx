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
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
} from 'react-native';
import {colors} from '../../config/theme';
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
    navigation.navigate('BottomTab');
  };

  return (
    <>
      <ImageBackground
        source={require('../../assets/Ellipse.png')}
        style={styles.background}
        resizeMode="cover">
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
            <Image source={require('../../assets/OTP.png')} style={styles.image} />
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
                  onPress={() => navigation.navigate('LoginScreen')}
                  style={styles.resendOtp}>
                  {' '}
                  Resend OTP
                </Text>
              </Text>
            </View>
            <View style={styles.Bottom}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SignInScreen')}>
                <Text style={styles.buttonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </>
  );
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingBottom: 400,
    backgroundColor: colors.white,
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
    paddingTop: 37,
    padding: 20,
  },
  Bottom: {
    paddingTop: 70,
    padding: 15,
  },
  image: {
    width: '90%',
    height: 230,
    alignSelf: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
  },
  boldText: {
    fontWeight: '500',
    color: colors.Text,
  },
  otpText: {
    padding: 10,
  },
  label: {
    color: colors.primary,
    fontSize: 20,
    marginBottom: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  subText: {
    color: colors.darkGray,
    textAlign: 'center',
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 10,
    // padding: 10,
    gap: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  resend: {
    alignSelf: 'center',
    color: colors.placeholderText,
  },
  resendOtp: {
    color: colors.primary,
    fontFamily: '700',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
export default OtpScreen;
