import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import OTPTextInput from "react-native-otp-textinput";
import { showToast } from "../utils/toast";

export default function OTPScreen({ route, navigation }) {
  const { phone, otp: initialOtp } = route.params;
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otp, setOtp] = useState(initialOtp);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const resendOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000);
    setOtp(newOtp);
    showToast(`New OTP is ${newOtp}`);
  };

  const verifyOtp = () => {
    if (enteredOtp === String(otp)) {
      navigation.replace("Home");
      return;
    }

    showToast("Invalid OTP");
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.title}>Verify Details</Text>

        <Text style={styles.subtitle}>OTP sent to</Text>
        <Text style={styles.phone}>+91 {phone}</Text>

        <OTPTextInput
          inputCount={4}
          handleTextChange={(text) => setEnteredOtp(text)}
          tintColor="#4CAF50"
        />

        <TouchableOpacity style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>Verify & Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resendOtp}>
          <Text style={styles.resend}>RESEND OTP</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 8,
  },

  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: "#666" },
  phone: { color: "#4CAF50", fontWeight: "bold", marginBottom: 20 },

  button: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: { color: "#fff", fontWeight: "bold" },

  resend: {
    color: "#4CAF50",
    marginTop: 15,
    fontWeight: "600",
  },
});
