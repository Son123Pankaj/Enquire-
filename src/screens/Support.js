import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Support = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support Screen</Text>
    </View>
  );
};

export default Support;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});