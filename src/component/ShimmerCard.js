import React from "react";
import { View, StyleSheet } from "react-native";
import CustomShimmer from "./CustomerShimmer";

export default function ShimmerCard() {
  return (
    <View style={styles.card}>
      <CustomShimmer style={styles.image} />

      <View style={{ marginLeft: 10, flex: 1 }}>
        <CustomShimmer style={styles.title} />
        <CustomShimmer style={styles.subtitle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  title: {
    width: "80%",
    height: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  subtitle: {
    width: "60%",
    height: 10,
    borderRadius: 5,
  },
});