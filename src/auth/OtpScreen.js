import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import OTPTextInput from "react-native-otp-textinput";
 import Home from   "../screens/HomeScreen"
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
  }, []);

  const resendOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000);
    setOtp(newOtp);
    Alert.alert("New OTP", newOtp.toString());
  };

 const verifyOtp = () => {
  if (enteredOtp == otp) {
    navigation.replace("MainApp"); // ✅ FINAL FIX
  } else {
    Alert.alert("Invalid OTP ❌");
  }
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