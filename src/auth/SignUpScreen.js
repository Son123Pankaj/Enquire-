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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signupUser } from "../services/auth";

export default function SignupScreen({ navigation }) {
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        account: {
          full_name: name,
          email,
          password,
          password_confirmation: confirmPassword,
        },
      };

      const response = await signupUser(payload);

      const token =
        response?.data?.token ||
        response?.data?.data?.token;

      if (!token) {
        Alert.alert("Error", "Token not received");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("token", token);

      setLoading(false);
      Alert.alert("Success ✅", "Account created");

      navigation.replace("MainApp");
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Signup Failed",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔝 HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.brand}>Welcome to</Text>
          <Text style={styles.brand}>Enquire</Text>
        </View>

        {/* 🧾 CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>Create your account</Text>

          {/* NAME */}
          <View style={styles.inputBox}>
            <Icon name="user" size={18} color="#666" />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputBox}>
            <Icon name="mail" size={18} color="#666" />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputBox}>
            <Icon name="lock" size={18} color="#666" />
            <TextInput
              placeholder="Password"
              secureTextEntry={secure}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Icon name={secure ? "eye-off" : "eye"} size={18} />
            </TouchableOpacity>
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputBox}>
            <Icon name="lock" size={18} color="#666" />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry={confirmSecure}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
              <Icon name={confirmSecure ? "eye-off" : "eye"} size={18} />
            </TouchableOpacity>
          </View>

          {/* TERMS */}
          <Text style={styles.termsText}>
            By continuing, I agree to the{" "}
            <Text style={styles.highlight}>Terms</Text> &{" "}
            <Text style={styles.highlight}>Privacy Policy</Text>
          </Text>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* LOGIN */}
          <TouchableOpacity onPress={() => navigation.navigate("EmailLogin")}>
            <Text style={styles.link}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingBottom: 30,
  },

  header: {
    alignItems: "center",
    marginTop: 70,
    marginBottom: 20,
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
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

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 18,
    color: "#334155",
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
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 18,
    color: "#2563eb",
    fontWeight: "600",
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
});