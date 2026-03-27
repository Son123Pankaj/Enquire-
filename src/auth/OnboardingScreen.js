import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from "react-native";
import Swiper from "react-native-swiper";
import LinearGradient from "react-native-linear-gradient";

export default function OnboardingScreen({ navigation }) {
  const scheme = useColorScheme(); // 🌙 dark/light
  const [index, setIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      image: require("../../assets/slider1.png"),
      text: "Pay only for the minutes you talk",
    },
    {
      image: require("../../assets/slider2.png"),
      text: "Connect with experts instantly",
    },
    {
      image: require("../../assets/slider3.png"),
      text: "Verified professionals you can trust",
    },
  ];

  // 💫 animation on slide change
  const handleIndexChanged = (i) => {
    setIndex(i);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const isDark = scheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#fff" },
      ]}
    >
      {/* 🔥 SKIP BUTTON */}
      <TouchableOpacity
        style={styles.skip}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={{ color: isDark ? "#fff" : "#000" }}>Skip</Text>
      </TouchableOpacity>

      {/* 🔥 TOP CAROUSEL */}
      <View style={styles.top}>
        <Swiper
          loop={false}
          showsPagination={false}
          onIndexChanged={handleIndexChanged}
        >
          {slides.map((item, i) => (
            <View key={i} style={styles.slide}>
              <Image source={item.image} style={styles.image} />

              <LinearGradient
                colors={
                  isDark
                    ? ["transparent", "rgba(0,0,0,0.9)"]
                    : ["transparent", "rgba(0,0,0,0.6)"]
                }
                style={styles.overlay}
              />

              <Animated.Text
                style={[
                  styles.title,
                  { opacity: fadeAnim },
                ]}
              >
                {item.text}
              </Animated.Text>
            </View>
          ))}
        </Swiper>
      </View>

      {/* 🔥 BOTTOM */}
      <View style={styles.bottom}>
        
        {/* 📍 PROGRESS */}
        <Text style={[styles.progress, { color: isDark ? "#aaa" : "#555" }]}>
          {index + 1} / {slides.length}
        </Text>

        {/* 🔘 BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.buttonText}>
            {index === slides.length - 1
              ? "Get Started"
              : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* 📄 TERMS */}
        <Text style={[styles.terms, { color: isDark ? "#aaa" : "#666" }]}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms & Conditions</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  top: {
    height: "60%",
  },

  slide: {
    flex: 1,
    justifyContent: "flex-end",
  },

  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  bottom: {
    height: "40%",
    padding: 25,
    justifyContent: "center",
  },

  progress: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#4facfe",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  terms: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
  },

  link: {
    color: "#4facfe",
    fontWeight: "600",
  },
});