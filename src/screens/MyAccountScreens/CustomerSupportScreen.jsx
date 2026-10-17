import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../config/theme"; 
import CustomAlertModal from '../../components/CustomAlertModal';
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationCommon } from "../../redux/reducers/auth";


const CustomerSupportScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { applicationCommon } = useSelector((state) => state.Auth);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [contactError, setContactError] = useState(false);

  // ✅ Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('error');

  const loadContacts = useCallback(async () => {
    setLoadingContacts(true);
    setContactError(false);
    try {
      await dispatch(fetchApplicationCommon()).unwrap();
    } catch (error) {
      setContactError(true);
    } finally {
      setLoadingContacts(false);
    }
  }, [dispatch]);
  useEffect(() => { loadContacts(); }, [loadContacts]);

  const showModal = (title, message, type = 'error') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };


  const handlePress = async (type) => {
    if (loadingContacts) return;
    if (contactError) {
      showModal('Support unavailable', 'Unable to load support contact details. Please tap Retry.');
      return;
    }
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
      } else
        if (type === "email") {
        const email = applicationCommon?.mail_id;
        if (!email) {
          showModal('Support unavailable', 'The support email has not been provided. Please try again later.');
          return;
        }
        const subject = "Customer Support";
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
        await Linking.openURL(url);
      } else if (type === "phone") {
        const phone = applicationCommon?.contact_number;
        if (!phone) {
          showModal('Support unavailable', 'The support number has not been provided. Please try again later.');
          return;
        }
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
        <Text style={styles.header}>Support</Text>
      </View>

      <Text style={styles.description}>
        We’re here to help! Choose one of the options below to get in touch with
        our support team.
      </Text>
      {loadingContacts && <ActivityIndicator color={colors.primary} accessibilityLabel="Loading support details" />}
      {!loadingContacts && (contactError || !applicationCommon?.mail_id || !applicationCommon?.contact_number) && (
        <View>
          <Text style={styles.description} accessibilityRole="alert">
            {contactError ? 'Unable to load support contact details.' : 'Some support contact details are currently unavailable.'}
          </Text>
          <TouchableOpacity onPress={loadContacts} accessibilityRole="button">
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
{/* 
      <TouchableOpacity style={styles.card} onPress={() => handlePress("whatsapp")}>
        <Icon name="logo-whatsapp" size={28} color="#25D366" />
        <Text style={styles.cardText}>Chat on WhatsApp</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.card} disabled={loadingContacts} onPress={() => handlePress("email")}>
        <Icon name="mail-outline" size={28} color={colors.brandPrimary} />
        <View style={{flex: 1}}>
             <Text style={styles.cardText}>Send us an Email</Text>
             {applicationCommon?.mail_id ? <Text style={styles.subText}>{applicationCommon.mail_id}</Text> : null}
        </View>
        <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} disabled={loadingContacts} onPress={() => handlePress("phone")}>
        <Icon name="call-outline" size={28} color="#007AFF" />
         <View style={{flex: 1}}>
            <Text style={styles.cardText}>Call Support</Text>
            {applicationCommon?.contact_number ? <Text style={styles.subText}>{applicationCommon.contact_number}</Text> : null}
        </View>
        <Icon name="chevron-forward" size={24} color={colors.textSecondary} />
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
  retry: {color: colors.primary, marginBottom: 20, fontWeight: '600'},
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
  subText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    marginTop: 2,
  },
});
