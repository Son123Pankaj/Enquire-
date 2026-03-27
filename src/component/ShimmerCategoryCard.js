import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

export default function ShimmerCategoryCard() {
  return (
    <View style={styles.card}>
     <ShimmerPlaceHolder
  LinearGradient={LinearGradient}
  shimmerColors={["#eeeeee", "#dddddd", "#eeeeee"]}
  style={styles.title}
   />

      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={styles.sub}
      />

      <View style={styles.bottomRow}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.circle}
        />

        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={styles.count}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  title: {
    width: "70%",
    height: 14,
    borderRadius: 5,
    marginBottom: 8,
  },

  sub: {
    width: "50%",
    height: 10,
    borderRadius: 5,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  count: {
    width: 40,
    height: 20,
    borderRadius: 8,
  },
});