import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../config/theme';

export default function AddFoodScreen({navigation}) {
  return <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.link}>Back</Text></TouchableOpacity>
    <Text style={styles.title}>Add Product</Text>
    <Text style={styles.label}>Currently Not Available</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingTop: 50,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    marginVertical: 20,
  },
  label: {color: colors.textDark, marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: colors.textDark,
  },
  selected: {borderColor: colors.primary, backgroundColor: colors.brandSurface},
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: '#fff', fontWeight: '700'},
  link: {color: colors.primary},
});
