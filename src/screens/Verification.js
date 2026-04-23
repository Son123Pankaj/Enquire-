import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Verification = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Coming Soon</Text>
      <Text style={styles.subtitle}>
        We’re building something amazing for you. This feature will be available soon.
      </Text>
    </View>
  );
};

export default Verification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
});