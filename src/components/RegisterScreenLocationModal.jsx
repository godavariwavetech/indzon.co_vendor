import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const LocationModal = ({
  visible,
  locations,
  selectedLocation,
  onSelect,
  onClose,
}) => {
  const hasLocations = locations && locations.length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Select Location</Text>

          {hasLocations ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {locations.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.optionRow}
                  onPress={() => onSelect(item)} // ✅ pass whole object
                >
                  <Icon
                    name={
                      selectedLocation?.id === item.id
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={22}
                    color="#007AFF"
                  />
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noLocationContainer}>
              <Icon name="alert-circle-outline" size={40} color="#FF3B30" />
              <Text style={styles.noLocationText}>No locations found</Text>
            </View>
          )}

          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },
  noLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noLocationText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 8,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LocationModal;
