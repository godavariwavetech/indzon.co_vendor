import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {fetchShopDetails} from '../../redux/reducers/auth';
import {colors} from '../../config/theme';
import {RestaurantLogo} from '../../assets/index';

const RestaurantProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

    const userId = useSelector(state => state.Auth.userId);


  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  useEffect(() => {

     if (!userId) return;

    const getShopData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(fetchShopDetails(userId)).unwrap();
        setShop(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getShopData();
  }, [dispatch, userId]);

  const handlePasswordUpdate = () => {
    console.log('Password Updated:', password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Loading and Error States */}
      {loading && (
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      )}
      {error && <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>}

      {shop && (
        <>
          <View style={styles.logoContainer}>
            <Image
              source={shop.image ? {uri: shop.image} : RestaurantLogo}
              style={styles.logo}
            />
            <Text style={styles.name}>{shop.name}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="location" size={22} color={colors.brandPrimary} />
              <Text style={styles.infoText}>Address: {shop.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="time" size={22} color={colors.brandPrimary} />
              <Text style={styles.infoText}>Timings: {shop.timing}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="call" size={22} color={colors.brandPrimary} />
              <Text style={styles.infoText}>Mobile: {shop.mobile}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="mail" size={22} color={colors.brandPrimary} />
              <Text style={styles.infoText}>Email: {shop.email}</Text>
            </View>

            {/* Password Field */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter New Password"
                placeholderTextColor={colors.textSecondary2}
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureText(!secureText)}
                style={styles.eyeIcon}>
                <Icon
                  name={secureText ? 'eye-off' : 'eye'}
                  size={22}
                  color={colors.textSecondary2}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePasswordUpdate}>
              <Text style={styles.submitText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default RestaurantProfileScreen;

// styles remain same as your code

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.backgroundLight,
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: colors.cardBackground2,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary2,
    marginLeft: 10,
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.backgroundLight,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  eyeIcon: {
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
