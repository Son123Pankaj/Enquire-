import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CallRates = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Rates Screen</Text>
    </View>
  );
};

export default CallRates;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});