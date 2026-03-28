import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Favorite = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Screen</Text>
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
});