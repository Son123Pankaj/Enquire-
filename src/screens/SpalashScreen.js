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
import { extractIsBusiness, fetchCurrentUserProfile } from "../services/auth";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
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

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 300,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setTimeout(() => {
          navigation.replace("EmailLogin");
        }, 3000);
        return;
      }

      let isBusiness = null;
      const storedFlag = await AsyncStorage.getItem("is_business");

      if (storedFlag !== null) {
        try {
          isBusiness = JSON.parse(storedFlag);
        } catch (error) {
          isBusiness = storedFlag === "true";
        }
      }

      if (typeof isBusiness !== "boolean") {
        try {
          const profile = await fetchCurrentUserProfile();
          isBusiness = extractIsBusiness(profile);
          if (typeof isBusiness === "boolean") {
            await AsyncStorage.setItem(
              "is_business",
              JSON.stringify(isBusiness)
            );
          }
        } catch (error) {
          isBusiness = false;
        }
      }

      setTimeout(() => {
        navigation.replace(isBusiness ? "Home" : "MainApp");
      }, 3000);
    };

    checkLogin();
  }, [navigation, opacityAnim, scaleAnim, shimmerAnim, translateY]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.centerBox,
          {
            transform: [{ scale: scaleAnim }, { translateY }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View>
          <Image
            source={require("../../assets/preview-tax-logo-cropped.png")}
            style={styles.logo}
          />

          <Animated.View
            style={[
              { transform: [{ translateX: shimmerAnim }] },
            ]}
          />
        </View>

        {/* <Text style={styles.appName}>Preview Tax</Text> */}

        <Text style={styles.taglineMain}>Tax Means Preview Tax</Text>
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
    width,
    height,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  centerBox: {
    alignItems: "center",
  },

  logo: {
    width: 260,
    height: 72,
    resizeMode: "contain",
    marginBottom: 10,
  },

  // appName: {
  //   fontSize: 32,
  //   fontWeight: "bold",
  //   color: "#FF7A00",
  //   letterSpacing: 1,
  // },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  taglineMain: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
