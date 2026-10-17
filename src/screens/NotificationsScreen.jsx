import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {colors} from '../config/theme';
export default function NotificationsScreen({navigation}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.body}>Notifications arrive through push messages. Notification history is currently unavailable.</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    color: colors.textDark,
    fontWeight: '700',
    marginVertical: 20,
  },
  card: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 15,
  },
  heading: {fontWeight: '700', color: colors.textDark},
  body: {marginTop: 6, color: colors.textDark},
  link: {color: colors.primary},
});
