import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated } from "react-native";
//import { colors } from "../config/theme";

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();


        const timer = setTimeout(() => {
            navigation.replace("SignInScreen");
        }, 2000);

        return () => clearTimeout(timer);
    });

    return (
        <View style={styles.Container}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <Image source={require('../../assets/QUICKIEE.png')} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default SplashScreen