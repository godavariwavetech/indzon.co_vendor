import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../config/theme"; 

const CustomerSupportScreen = () => {
  const navigation = useNavigation();

  const handlePress = async (type) => {
    try {
      if (type === "whatsapp") {
        const phoneNumber = "919876543210"; 
        const url = `whatsapp://send?phone=${phoneNumber}&text=Hello, I need help!`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("WhatsApp not installed");
        }
      } else if (type === "email") {
        const email = "support@example.com";
        const subject = "Customer Support";
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        await Linking.openURL(url);
      } else if (type === "phone") {
        const phone = "+918765432100"; // ✅ Replace with support number
        const url = `tel:${phone}`;
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open app");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.header}>Customer Support</Text>
      </View>

      <Text style={styles.description}>
        We’re here to help! Choose one of the options below to get in touch with
        our support team. Our team is available 9 AM – 7 PM, Monday to Saturday.
      </Text>

      <TouchableOpacity style={styles.card} onPress={() => handlePress("whatsapp")}>
        <Icon name="logo-whatsapp" size={28} color="#25D366" />
        <Text style={styles.cardText}>Chat on WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handlePress("email")}>
        <Icon name="mail-outline" size={28} color={colors.brandPrimary} />
        <Text style={styles.cardText}>Send us an Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handlePress("phone")}>
        <Icon name="call-outline" size={28} color="#007AFF" />
        <Text style={styles.cardText}>Call Support</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomerSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 20,
    paddingTop:50,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  backButton: {
    marginRight: 10,
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 35,
    lineHeight: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    marginLeft: 12,
  },
});
