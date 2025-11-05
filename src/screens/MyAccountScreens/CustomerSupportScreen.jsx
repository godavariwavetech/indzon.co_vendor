import React, {useState} from "react";
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
import CustomAlertModal from '../../components/CustomAlertModal';


const CustomerSupportScreen = () => {
  const navigation = useNavigation();

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


  const handlePress = async (type) => {
    try {
      if (type === "whatsapp") {
        const phoneNumber = "919888888888"; 
        const url = `whatsapp://send?phone=${phoneNumber}&text=Hello, I need help!`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          showModal("WhatsApp not installed");
        }
      } else if (type === "email") {
        const email = "support@example.com";
        const subject = "Customer Support";
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        await Linking.openURL(url);
      } else if (type === "phone") {
        const phone = "9999999999"; // ✅ Replace with support number
        const url = `tel:${phone}`;
        await Linking.openURL(url);
      }
    } catch (error) {
    showModal("Error", "Unable to open app");
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
        our support team.
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
      <CustomAlertModal
  visible={modalVisible}
  title={modalTitle}
  message={modalMessage}
  type={modalType}
  onClose={() => setModalVisible(false)}
/>

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
