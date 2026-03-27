import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  useColorScheme,
  Easing,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔥 IMPORTANT

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const scheme = useColorScheme();

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  const particles = Array.from({ length: 8 }).map(() => ({
    translateY: useRef(new Animated.Value(Math.random() * height)).current,
    translateX: useRef(new Animated.Value(Math.random() * width)).current,
    opacity: useRef(new Animated.Value(Math.random())).current,
  }));

  useEffect(() => {
    // 🔥 ENTRY ANIMATION
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
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

    // 💓 Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✨ Shimmer
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 💫 Particles
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.translateY, {
            toValue: -50,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 🔥 TOKEN CHECK + NAVIGATION
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");

      setTimeout(() => {
        if (token) {
          navigation.replace("MainApp"); // ✅ already logged in
        } else {
          navigation.replace("Onboarding"); // ❌ not logged in
        }
      }, 3000);
    };

    checkLogin();
  }, []);

  const gradientColors =
    scheme === "dark"
      ? ["#0f2027", "#203a43", "#2c5364"]
      : ["#667eea", "#764ba2"];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      
      {/* 💫 particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateY: p.translateY },
                { translateX: p.translateX },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}

      {/* 💎 glow */}
      <View style={styles.glowCircle} />

      {/* 🔥 LOGO */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale: scaleAnim },
              { translateY },
              { scale: pulseAnim },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={{ overflow: "hidden" }}>
          <Image
            source={require("../../assets/logo.jpeg")}
            style={styles.logo}
          />

          {/* ✨ SHIMMER */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerAnim }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  glowCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  card: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  logo: {
    width: 260,
    height: 110,
    resizeMode: "contain",
  },

  shimmer: {
    position: "absolute",
    width: 80,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.4)",
    opacity: 0.4,
  },

  particle: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
});