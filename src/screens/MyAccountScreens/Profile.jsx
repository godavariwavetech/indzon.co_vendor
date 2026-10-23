import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  updateVendorPassword,
  fetchShopDetails,
} from '../../redux/reducers/auth';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../config/theme';
import {RestaurantLogo} from '../../assets/index';

const ProfileSkeleton = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  const SkeletonBox = ({width, height, borderRadius, style}) => (
    <Animated.View
      style={[
        {opacity, backgroundColor: '#E0E0E0', width, height, borderRadius},
        style,
      ]}
    />
  );

  return (
    <View style={[styles.container, {paddingTop: 50}]}>
      <View style={[styles.logoContainer, {marginTop: 30}]}>
        <SkeletonBox
          width={100}
          height={100}
          borderRadius={50}
          style={{marginBottom: 10}}
        />
        <SkeletonBox width={150} height={24} borderRadius={4} />
      </View>

      <View style={styles.card}>
        {[1, 2, 3, 4].map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 18,
            }}>
            <SkeletonBox width={22} height={22} borderRadius={11} />
            <SkeletonBox
              width={200}
              height={16}
              borderRadius={4}
              style={{marginLeft: 10}}
            />
          </View>
        ))}
        {/* Input Skeleton */}
        <SkeletonBox
          width="100%"
          height={50}
          borderRadius={10}
          style={{marginTop: 10}}
        />
        {/* Button Skeleton */}
        <SkeletonBox
          width="100%"
          height={45}
          borderRadius={10}
          style={{marginTop: 15}}
        />
      </View>
    </View>
  );
};

const RestaurantProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const userId = useSelector(state => state.Auth.userId);

  const initialShop = useSelector(state => state.Auth.shopDetails);
  const [shop, setShop] = useState(initialShop);
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

  const handlePasswordUpdate = async () => {
    if (!password) {
      alert('Please enter a new password');
      return;
    }

    try {
      setLoading(true);
      const resultAction = await dispatch(
        updateVendorPassword({userId, newPassword: password}),
      );

      if (updateVendorPassword.fulfilled.match(resultAction)) {
        alert(resultAction.payload); // ✅ success message
        setPassword('');
      } else {
        alert(resultAction.payload || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !shop) {
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity
          style={[styles.backButton, {zIndex: 10}]}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Error message */}
      {error && <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>}

      {/* Shop Info (with fallback placeholders) */}
      <View style={styles.logoContainer}>
        <Image
          source={shop?.image ? (typeof shop.image === "string" ? {uri: shop.image} : shop.image) : RestaurantLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.name}>{shop?.name || '--'}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Icon name="map" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>Location: {shop?.location || '--'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="pricetag" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>
            Commission: {shop?.commission != null && Number.isFinite(Number(shop.commission))
              ? String(shop.commissionType) === '0' ? `${Number(shop.commission)}%`
                : String(shop.commissionType) === '1' ? `₹${Number(shop.commission).toFixed(2)} per order` : '--'
              : '--'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>Address: {shop?.address || '--'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>Timings: {shop?.timing || '--'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>Mobile: {shop?.mobile || '--'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="mail" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>Email: {shop?.email || '--'}</Text>
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
          onPress={handlePasswordUpdate}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RestaurantProfileScreen;

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
    borderRadius: 8,
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
