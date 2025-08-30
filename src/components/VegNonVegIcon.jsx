import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../config/theme";

const VegNonVegIcon = ({ isVeg, useIonicons = true }) => {
  if (useIonicons) {
    return (
      <View style={styles.vegIconWrapper}>
        <Icon
          name="square-outline"
          size={16}
          color={isVeg ? colors.veg : colors.nonVeg}
        />
        <Icon
          name="ellipse"
          size={8}
          color={isVeg ? colors.veg : colors.nonVeg}
          style={styles.vegIconDot}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.vegNonVegContainer,
        { borderColor: isVeg ? colors.veg : colors.nonVeg },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isVeg ? colors.veg : colors.nonVeg },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  vegIconWrapper: {
    marginRight: 6,
  },
  vegIconDot: {
    position: "absolute",
    top: 4,
    left: 4,
  },
  vegNonVegContainer: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default VegNonVegIcon;
