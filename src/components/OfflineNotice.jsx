import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { colors } from '../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OfflineNotice = () => {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  
  if (netInfo.isConnected === false) {
    return (
      <View style={[styles.offlineContainer, { paddingTop: insets.top }]}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: colors.danger,
    width: Dimensions.get('window').width,
    position: 'absolute',
    top: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  offlineText: {
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default OfflineNotice;
