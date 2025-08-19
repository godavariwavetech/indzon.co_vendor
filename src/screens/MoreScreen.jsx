import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import AdvertisementsCarousel from "../components/AdvertisementsCarousel";

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
          onPress={() => navigation.navigate("AddFoodScreen")}
        />
        <MenuItem
          icon="message-text-outline"
          title="Customer care support"
          onPress={() => navigation.navigate("CustomerSupportScreen")}
        />
        <MenuItem
          icon="file-lock-outline"
          title="Privacy Policy"
          onPress={() => navigation.navigate("SignInScreen")}
        />
        <MenuItem
          icon="file-lock-outline"
          title="Terms & Conditions"
          onPress={() => navigation.navigate("SignInScreen")}
        />
        <MenuItem
          icon="logout"
          title="Logout"
          onPress={() => {
            // Add logout logic
            navigation.replace("VerificationScreen");
          }}
        />
         <MenuItem
          icon="order"
          title="BillSummary"
          onPress={() => {
            navigation.navigate("BillSummary");
          }}
        />
        
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={22} color="#000" />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    //padding: 16,
    paddingTop:40
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 13.6,
    shadowOffset: { width: 0, height: 0},
    margin:15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1B1B1B",
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1849C6",
    paddingLeft: 8,
    marginLeft:-15
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 14,
    color: "#1B1B1B",
    marginLeft: 10,
  },
});
