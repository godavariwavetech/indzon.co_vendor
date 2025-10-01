import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Image, Animated} from 'react-native';
import {colors} from '../../config/theme';
import {appLogo} from '../../assets/index';
import {useSelector} from 'react-redux';

const SplashScreen = ({navigation}) => {
  const {userId} = useSelector(state => state.Auth);
  const {rehydrated} = useSelector(state => state.Auth._persist);
  const navigateToApp = () => {
    if (!userId) {
      navigation.replace('SignInScreen');
    } else {
      navigation.replace('BottomTabNavigation');
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    const initialize = async () => {
      if (rehydrated) {
        navigateToApp();
      }
    };
    const timer = setTimeout(initialize, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rehydrated]);

  return (
    <View style={styles.Container}>
      <Animated.View style={{opacity: fadeAnim}}>
        <Image source={appLogo} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
