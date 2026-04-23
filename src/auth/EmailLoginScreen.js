import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  extractAuthToken,
  extractIsBusiness,
  fetchCurrentUserProfile,
} from "../services/auth";
import { showToast } from "../utils/toast";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const resolveBusinessFlag = async (loginResponse) => {
    const loginFlag = extractIsBusiness(loginResponse);
    if (typeof loginFlag === "boolean") {
      return loginFlag;
    }

    const profile = await fetchCurrentUserProfile();
    return extractIsBusiness(profile) ?? false;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        account: { email, password },
      });

      const token = extractAuthToken(response);

      if (!token) {
        showToast("Token not received");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("token", token);

      const isBusiness = await resolveBusinessFlag(response);
      await AsyncStorage.setItem("is_business", JSON.stringify(isBusiness));

      setLoading(false);
      navigation.replace(isBusiness ? "Home" : "MainApp");
    } catch (error) {
      setLoading(false);
      showToast(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo-1.webp")}
          style={styles.logo}
        />

        <Text style={styles.brand}>Welcome to PreviewTax</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.loginTitle}>Enter your email and password</Text>

        <View style={styles.inputBox}>
          <Icon name="mail" size={18} color="#666" />
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType= "email-address"
          />
        </View>

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

        <Text style={styles.termsText}>
          By continuing, I agree to the <Text style={styles.highlight}>Terms</Text>
          {" "} & <Text style={styles.highlight}>Privacy Policy</Text>
        </Text>

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

        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.highlight}>Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.bottomText}>
              New User? <Text style={styles.highlight}>Create Account</Text>
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
    width: 120,
    height: 120,
    marginBottom: 0,
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
    marginBottom: 10,
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
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },

  highlight: {
    color: "#e67e22",
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  bottomText: {
    color: "#475569",
    fontSize: 13,
  },
});
