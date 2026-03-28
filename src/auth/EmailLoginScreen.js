import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../services/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        account: { email, password },
      });

      const token =
        response?.data?.token ||
        response?.data?.data?.token ||
        response?.data?.access_token;

      if (!token) {
        Alert.alert("Error", "Token not received");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("token", token);

      setLoading(false);
      navigation.replace("MainApp");
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo.png")} 
          style={styles.logo}
        />

        <Text style={styles.brand}>Welcome to</Text>
        <Text style={styles.brand}>Enquire</Text>
      </View>

      {/* 🔐 LOGIN CARD */}
      <View style={styles.card}>
        <Text style={styles.loginTitle}>
          Enter your email and password
        </Text>

        {/* EMAIL */}
        <View style={styles.inputBox}>
          <Icon name="mail" size={18} color="#666" />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputBox}>
          <Icon name="lock" size={18} color="#666" />
          <TextInput
            placeholder="Enter your password"
            secureTextEntry={secure}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon name={secure ? "eye-off" : "eye"} size={18} />
          </TouchableOpacity>
        </View>

        {/* TERMS */}
        <Text style={styles.termsText}>
          By continuing, I accept the{" "}
          <Text style={styles.highlight}>Terms of Service</Text>
        </Text>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* 🔥 BOTTOM LINKS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.bottomText}>Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.bottomText}>
              New User? <Text style={styles.highlight}>Create</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    alignItems: "center",
    marginTop: 70,
    marginBottom: 20,
  },

  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
    resizeMode: "contain",
  },

  brand: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  loginTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 18,
    color: "#64748b",
    textAlign: "center",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#0f172a",
  },

  button: {
    backgroundColor: "#e67e22",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10, // 🔥 spacing fix

    shadowColor: "#e67e22",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  termsText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginVertical: 10,
  },

  highlight: {
    color: "#2563eb",
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  bottomText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
});