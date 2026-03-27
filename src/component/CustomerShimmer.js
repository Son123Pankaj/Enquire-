import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function CustomShimmer({ style }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[style, { overflow: "hidden", backgroundColor: "#e0e0e0" }]}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
          transform: [{ translateX }],
          opacity: 0.4,
        }}
      />
    </View>
  );
}