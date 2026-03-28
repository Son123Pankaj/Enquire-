import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Schedule = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule Screen</Text>
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});