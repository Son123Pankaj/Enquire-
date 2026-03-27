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
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔥 TOKEN SAVE
import { signupUser } from "../services/auth";

export default function SignupScreen({ navigation }) {
  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isDark = useColorScheme() === "dark";

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

 const handleSignup = async () => {
  if (!name || !email || !password || !confirmPassword) {
    Alert.alert("Error", "All fields are required");
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

    console.log("🔥 FINAL PAYLOAD:", JSON.stringify(payload));

    const response = await signupUser(payload); // ✅ full payload

    console.log("✅ SUCCESS:", response.data);

    await AsyncStorage.setItem("token", response.data.token);

    setLoading(false);

    Alert.alert("Success ✅", "Account created");

    navigation.replace("MainApp");

  } catch (error) {
    setLoading(false);

    console.log("❌ ERROR:", JSON.stringify(error.response?.data));

    Alert.alert(
      "Signup Failed",
      JSON.stringify(error.response?.data) || "Something went wrong"
    );
  }
};
  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43"] : ["#4facfe", "#00f2fe"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Account 🚀</Text>

        <View style={styles.inputBox}>
          <Icon name="user" size={18} />
          <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputBox}>
          <Icon name="mail" size={18} />
          <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.inputBox}>
          <Icon name="lock" size={18} />
          <TextInput placeholder="Password" secureTextEntry={secure} style={styles.input} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon name={secure ? "eye-off" : "eye"} size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputBox}>
          <Icon name="lock" size={18} />
          <TextInput placeholder="Confirm Password" secureTextEntry={confirmSecure} style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} />
          <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
            <Icon name={confirmSecure ? "eye-off" : "eye"} size={18} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("EmailLogin")}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  card: { margin: 20, backgroundColor: "#fff", padding: 25, borderRadius: 20, elevation: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: { flex: 1, padding: 12 },
  button: { backgroundColor: "#4facfe", padding: 15, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 15, textAlign: "center", color: "#4facfe" },
});