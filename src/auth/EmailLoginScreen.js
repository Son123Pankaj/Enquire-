import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../services/auth";

export default function EmailLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const isDark = useColorScheme() === "dark";

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    try {
      setLoading(true);

     const payload = {
        account: {
          email,
          password,
        },
      };
      
      console.log("🔥 FULL RESPONSE:", JSON.stringify(payload));
         const response = await loginUser(payload);
      // 🔥 UNIVERSAL TOKEN HANDLING (FIX)
      const token =
        response?.data?.token ||
        response?.data?.data?.token ||
        response?.data?.access_token;

      if (!token) {
        Alert.alert("Error ❌", "Token not received from server");
        setLoading(false);
        return;
      }

      // ✅ SAVE TOKEN
      await AsyncStorage.setItem("token", token);

      setLoading(false);

      Alert.alert("Success ✅", "Login successful");

      navigation.replace("MainApp");

    } catch (error) {
      setLoading(false);

      console.log("❌ LOGIN ERROR FULL:", error);
      console.log("❌ LOGIN ERROR DATA:", error?.response?.data);

      Alert.alert(
        "Login Failed ❌",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43"] : ["#fff", "#fff"]}
      style={styles.container}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
        ]}
      >
        <Text style={styles.title}>Welcome Back 👋</Text>

        {/* Email */}
        <View style={styles.inputBox}>
          <Icon name="mail" size={18} color="#777" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputBox}>
          <Icon name="lock" size={18} color="#777" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={secure}
            style={[styles.input, { color: isDark ? "#fff" : "#000" }]}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon name={secure ? "eye-off" : "eye"} size={18} />
          </TouchableOpacity>
        </View>

        {/* Button */}
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

        {/* Signup */}
        <TouchableOpacity onPress={() => navigation.push("Signup")}>
          <Text style={styles.link}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },

  card: {
    margin: 20,
    padding: 25,
    borderRadius: 20,
    elevation: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#4facfe",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  input: { flex: 1, padding: 12, fontSize: 15 },

  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#4facfe",
    fontWeight: "600",
  },
});