import React from "react";
import { View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function VerifiedBadge({ size = 16, style }) {
  const outerSize = size;
  const innerSize = Math.max(9, Math.round(size * 0.65));

  return (
    <View
      style={[
        styles.badge,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
        },
        style,
      ]}
    >
      <Icon name="check" size={innerSize} color="#ffffff" style={styles.checkIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#f97316", // Vibrant orange badge
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  checkIcon: {
    fontWeight: "bold",
  },
});
