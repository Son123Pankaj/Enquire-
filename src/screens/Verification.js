import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Verification = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification Screen</Text>
    </View>
  );
};

export default Verification;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});