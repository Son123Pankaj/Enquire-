import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Privacy = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Screen</Text>
    </View>
  );
};

export default Privacy;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});