import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../config/theme';

// Shared top bar. Uses the real safe-area inset rather than a fixed
// paddingTop, so it clears the notch / Dynamic Island on iPhone and the
// translucent status bar on Android alike.
export default function ScreenHeader({title, showBack = true, onBack, right}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, {paddingTop: insets.top + 14}]}>
      {showBack && (
        <TouchableOpacity
          onPress={onBack || (() => navigation.goBack())}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.backButton}>
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      <Text
        style={[styles.title, !showBack && styles.titleCentered]}
        numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgrey',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
  },
  backButton: {marginRight: 12},
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleCentered: {textAlign: 'center'},
});
