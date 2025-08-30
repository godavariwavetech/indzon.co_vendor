import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../config/theme';
import {RestaurantLogo} from '../../assets/index';

const RestaurantProfileScreen = () => {
  const navigation = useNavigation();

  const restaurant = {
    name: 'Add Your Restaurant Name',
    address: '123 Main Street, Rajahmundry, India',
    timing: 'Mon - Sun | 10:00 AM - 11:00 PM',
    mobile: '9876543210',
    email: 'addyouremail@gmail.com',
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image source={RestaurantLogo} style={styles.logo} />
        <Text style={styles.name}>{restaurant.name}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Icon name="location" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>{restaurant.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="time" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>{restaurant.timing}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>{restaurant.mobile}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="mail" size={22} color={colors.brandPrimary} />
          <Text style={styles.infoText}>{restaurant.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
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
  button: {
    marginTop: 30,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: colors.buttonTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
});
