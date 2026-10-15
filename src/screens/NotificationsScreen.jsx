import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {markDemoNotification} from '../demo/store';
import {colors} from '../config/theme';
export default function NotificationsScreen({navigation}) {
  const notifications = useSelector(state => state.Auth.notifications || []);
  const dispatch = useDispatch();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Notifications</Text>
      <TouchableOpacity onPress={() => dispatch(markDemoNotification())}>
        <Text style={styles.link}>Mark all as read</Text>
      </TouchableOpacity>
      {notifications.map(n => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.heading}>
            {n.read ? '' : 'New: '}
            {n.title}
          </Text>
          <Text style={styles.body}>{n.body}</Text>
        </View>
      ))}
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
