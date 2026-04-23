import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signupUser,
  extractAuthToken,
  extractIsBusiness,
} from "../services/auth";
import { showToast } from "../utils/toast";

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
      showToast("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match");
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
      const token = extractAuthToken(response);

      if (!token) {
        showToast("Token not received");
        setLoading(false);
        return;
      }

      const isBusiness = extractIsBusiness(response);

      await AsyncStorage.setItem("token", token);
      if (typeof isBusiness === "boolean") {
        await AsyncStorage.setItem("is_business", JSON.stringify(isBusiness));
      }

      setLoading(false);
      showToast("Account created");
      navigation.replace("MainApp");
    } catch (error) {
      setLoading(false);
      showToast(error?.response?.data?.message || "Signup failed");
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
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo-1.webp")}
            style={styles.logo}
          />
          <Text style={styles.brand}>Welcome to PreviewTax</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create your account</Text>

          <View style={styles.inputBox}>
            <Icon name="user" size={18} color="#666" />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputBox}>
            <Icon name="mail" size={18} color="#666" />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

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

          <Text style={styles.termsText}>
            By continuing, I agree to the <Text style={styles.highlight}>Terms</Text>
            {" "} & <Text style={styles.highlight}>Privacy Policy</Text>
          </Text>

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

          <TouchableOpacity onPress={() => navigation.navigate("EmailLogin")}>
            <Text style={styles.termsText}>
              Already have an account? <Text style={styles.highlight}>LogIn</Text>
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
    marginTop: 40,
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 120,
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
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
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

  termsText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },

  highlight: {
    color: "#e67e22",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#e67e22",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
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
});
