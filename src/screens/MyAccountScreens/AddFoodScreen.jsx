import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../config/theme';
import {
  fetchCategories,
  fetchSubCategories,
  fetchItemsToAssign,
} from '../../redux/reducers/auth';

const SelectModal = ({visible, title, options, selectedId, onSelect, onClose, loading, emptyLabel}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>{title}</Text>

        {loading ? (
          <View style={styles.modalLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : options.length === 0 ? (
          <View style={styles.modalLoader}>
            <Text style={styles.emptyText}>{emptyLabel || 'No options available'}</Text>
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => onSelect(item)}>
                <Ionicons
                  name={selectedId === item.id ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function AddFoodScreen({navigation}) {
  const dispatch = useDispatch();
  const {userId, shopDetails, itemsToAssign, loading, errors} = useSelector(state => state.Auth);
  const itemsError = errors?.fetchItemsToAssign;

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);

  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsLoadError, setItemsLoadError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true);
      try {
        const response = await dispatch(fetchCategories());
        setCategoryOptions(response?.payload || []);
      } catch {
        setCategoryOptions([]);
      } finally {
        setCategoryLoading(false);
      }
    };
    loadCategories();
  }, [dispatch]);

  const handleSelectCategory = useCallback(
    async item => {
      setSelectedCategory(item);
      setCategoryModalVisible(false);
      setSelectedSubCategory(null);
      setSubCategoryOptions([]);
      setItemsLoadError(null);

      setSubCategoryLoading(true);
      try {
        const response = await dispatch(fetchSubCategories(item.id));
        setSubCategoryOptions(response?.payload || []);
      } catch {
        setSubCategoryOptions([]);
      } finally {
        setSubCategoryLoading(false);
      }
    },
    [dispatch],
  );

  const handleSelectSubCategory = useCallback(item => {
    setSelectedSubCategory(item);
    setSubCategoryModalVisible(false);
  }, []);

  useEffect(() => {
    if (!selectedCategory || !userId) return;

    const loadItems = async () => {
      setItemsLoading(true);
      setItemsLoadError(null);
      try {
        const response = await dispatch(
          fetchItemsToAssign({
            shop_id: userId,
            category_id: selectedCategory.id,
            subcategory_id: selectedSubCategory?.id,
            table_name: shopDetails?.shopItemsTableName,
          }),
        );
        console.log('AddFoodScreen: fetchItemsToAssign result', response);
      } finally {
        setItemsLoading(false);
      }
    };
    loadItems();
  }, [dispatch, userId, shopDetails, selectedCategory, selectedSubCategory]);

  const renderItemCard = ({item}) => (
    <View style={styles.card}>
      {item.item_image ? (
        <Image
          source={{uri: item.item_image}}
          style={styles.foodImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.foodImage, styles.foodImagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="square-circle"
            size={14}
            color={item.filter_one === 'Veg' ? colors.veg : colors.nonVeg}
            style={{marginRight: 6}}
          />
          <Text style={styles.foodName}>{item.item_name}</Text>
        </View>
        {!!item.sub_category_name && (
          <Text style={styles.subCategoryLabel}>{item.sub_category_name}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.selling_price}</Text>
          {item.actual_price &&
            parseFloat(item.actual_price) > parseFloat(item.selling_price) && (
              <Text style={styles.actualPrice}>₹{item.actual_price}</Text>
            )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
      </View>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setCategoryModalVisible(true)}>
        <Text style={selectedCategory ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selectedCategory?.name || 'Select Category'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.dropdown, !selectedCategory && styles.dropdownDisabled]}
        disabled={!selectedCategory}
        onPress={() => setSubCategoryModalVisible(true)}>
        <Text style={selectedSubCategory ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selectedSubCategory?.name || 'Select Sub Category (optional)'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textLight} />
      </TouchableOpacity>

      {!selectedCategory ? (
        <Text style={styles.hintText}>Choose a category to view available products.</Text>
      ) : itemsLoadError ? (
        <Text style={[styles.hintText, {color: colors.danger}]}>{itemsLoadError}</Text>
      ) : itemsLoading || loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : itemsError ? (
        <Text style={[styles.hintText, {color: colors.danger}]}>{String(itemsError)}</Text>
      ) : (
        <FlatList
          data={itemsToAssign}
          keyExtractor={item => String(item.id)}
          renderItem={renderItemCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 30}}
          ListEmptyComponent={
            <Text style={styles.hintText}>
              No products available to add for this selection.
            </Text>
          }
        />
      )}

      <SelectModal
        visible={categoryModalVisible}
        title="Select Category"
        options={categoryOptions}
        selectedId={selectedCategory?.id}
        onSelect={handleSelectCategory}
        onClose={() => setCategoryModalVisible(false)}
        loading={categoryLoading}
      />

      <SelectModal
        visible={subCategoryModalVisible}
        title="Select Sub Category"
        options={subCategoryOptions}
        selectedId={selectedSubCategory?.id}
        onSelect={handleSelectSubCategory}
        onClose={() => setSubCategoryModalVisible(false)}
        loading={subCategoryLoading}
        emptyLabel="No subcategories available"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginLeft: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownValue: {
    color: colors.textDark,
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: colors.textLight,
    fontSize: 14,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 30,
    color: colors.textLight,
    fontSize: 13,
  },
  loaderContainer: {
    marginTop: 40,
    alignItems: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.75,
    borderColor: colors.black,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  foodImage: {height: 70, width: 65, borderRadius: 8},
  foodImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {color: '#888', fontSize: 10, textAlign: 'center'},
  cardContent: {flex: 1, marginLeft: 10},
  row: {flexDirection: 'row', alignItems: 'center'},
  foodName: {fontSize: 14, fontWeight: '500', color: colors.textDark, flexShrink: 1},
  subCategoryLabel: {fontSize: 12, color: colors.textLight, marginTop: 2},
  priceRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  price: {fontSize: 14, fontWeight: 'bold', marginRight: 8, color: colors.textDark},
  actualPrice: {
    fontSize: 12,
    color: colors.grey,
    textDecorationLine: 'line-through',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.textDark,
    textAlign: 'center',
  },
  modalLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {color: colors.textLight, fontSize: 14},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {fontSize: 14, marginLeft: 10, color: colors.textDark},
  modalButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
