import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Approval = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approval Screen</Text>
    </View>
  );
};

export default Approval;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});