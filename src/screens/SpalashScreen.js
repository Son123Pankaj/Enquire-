import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Text,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    // ENTRY ANIMATION
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // SHIMMER
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // NAVIGATION
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");

      setTimeout(() => {
        if (token) {
          navigation.replace("MainApp");
        } else {
          navigation.replace("EmailLogin");
        }
      }, 3000);
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.container}>

      {/* 🔥 MAIN CONTENT */}
      <Animated.View
        style={[
          styles.centerBox,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* 🔝 LOGO */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />

          {/* ✨ SHIMMER */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerAnim }] },
            ]}
          />
        </View>

        {/* 🟠 APP NAME */}
        <Text style={styles.appName}>Enquire</Text>

        {/* 📝 TAGLINE */}
        <Text style={styles.tagline}>
          Find Experts • Get Advice • Solve Problems
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // 🔥 WHITE BACKGROUND
    justifyContent: "center",
    alignItems: "center",
  },

  centerBox: {
    alignItems: "center",
  },

  logoWrapper: {
    overflow: "hidden",
    borderRadius: 20,
    padding: 15,
    backgroundColor: "#353b48", // light card effect
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },

  shimmer: {
    position: "absolute",
    width: 60,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.1)", // subtle shimmer for white bg
    opacity: 0.2,
  },

  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF7A00", // 🔥 ORANGE
    letterSpacing: 1,
  },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: "#666", // dark text for white bg
    textAlign: "center",
  },
});