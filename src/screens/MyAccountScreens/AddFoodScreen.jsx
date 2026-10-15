import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {addDemoProduct} from '../../demo/store';
import {categories} from '../../demo/data';
import {DEMO_MODE} from '../../demo/config';
import {colors} from '../../config/theme';

export default function AddFoodScreen({navigation}) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [category, setCategory] = useState(categories[0]);
  const save = async () => {
    try {
      await dispatch(
        addDemoProduct({
          item_name: name.trim(),
          description,
          selling_price: Number(price),
          actual_price: Number(price),
          stock: Number(stock),
          sub_category_id: category.id,
          sub_category_name: category.name,
        }),
      ).unwrap();
      Alert.alert(
        'Product added',
        'Available in your catalogue and inventory.',
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Check product details', String(error));
    }
  };
  if (!DEMO_MODE)
    return (
      <View>
        <Text>Currently Not Available</Text>
      </View>
    );
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add Product</Text>
      {[
        ['Product name', name, setName, 'default'],
        ['Description', description, setDescription, 'default'],
        ['Selling price (INR)', price, setPrice, 'decimal-pad'],
        ['Stock quantity', stock, setStock, 'number-pad'],
      ].map(([label, value, change, keyboard]) => (
        <View key={label}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            style={styles.input}
            value={value}
            onChangeText={change}
            keyboardType={keyboard}
          />
        </View>
      ))}
      <Text style={styles.label}>Category</Text>
      {categories.map(c => (
        <TouchableOpacity
          key={c.id}
          style={[styles.input, category.id === c.id && styles.selected]}
          onPress={() => setCategory(c)}>
          <Text>{c.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
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
