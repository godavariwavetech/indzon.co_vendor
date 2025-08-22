import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AdvertisementsCarousel from '../components/AdvertisementsCarousel';
import  {colors}  from '../config/theme'; 

export default function MoreScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Advertisement Card */}
      <AdvertisementsCarousel navigation={navigation} />

      {/* My Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Account</Text>

        <MenuItem
          icon="silverware-fork-knife"
          title="Add Food"
          onPress={() => navigation.navigate('CustomerSupportScreen')}
        />
        <MenuItem
          icon="message-text-outline"
          title="Customer care support"
          onPress={() => navigation.navigate('BillSummary')}
        />
        <MenuItem
          icon="file-lock-outline"
          title="Privacy Policy"
          onPress={() => navigation.navigate('CustomerSupportScreen')}
        />
        <MenuItem
          icon="file-lock-outline"
          title="Terms & Conditions"
          onPress={() => navigation.navigate('CustomerSupportScreen')}
        />
        <MenuItem 
          icon="logout"
          title="Logout"
          onPress={() => {
            // Add logout logic
            navigation.navigate('CustomerSupportScreen');
          }}
        />
      </View>
    </ScrollView>
  );
}

function MenuItem({icon, title, onPress}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={22} color={colors.moreIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.moreChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.moreBackground,
    paddingTop: 40,
  },
  section: {
    backgroundColor: colors.moreBackground,
    borderRadius: 11,
    padding: 15,
    elevation: 5,
    shadowColor: colors.moreShadow,
    shadowOpacity: 0.07,
    shadowRadius: 13.6,
    shadowOffset: {width: 0, height: 0},
    margin: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.moreTextDark,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.morePrimary,
    paddingLeft: 8,
    marginLeft: -15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: colors.moreTextDark,
    marginLeft: 10,
  },
});
