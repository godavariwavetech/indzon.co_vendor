import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../config/theme';

export default function NoInternetScreen({onRetry}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.subtitle}>Please check your connection and try again.</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
  title: {fontSize: 20, fontWeight: 'bold', color: colors.danger, marginBottom: 10, textAlign: 'center'},
  subtitle: {fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 20},
  button: {backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8},
  buttonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});
