import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const handleLogin = () => {
    if (phone.length !== 10) {
      Alert.alert("Error", "Enter valid mobile number");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000);

      Alert.alert("Your OTP", `${generatedOtp}`);

      setLoading(false);

      navigation.navigate("OTP", {
        phone,
        otp: generatedOtp,
      });
    }, 1500);
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#0f2027", "#203a43", "#2c5364"]
          : ["#4facfe", "#00f2fe"]
      }
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        
        {/* 🔥 TOP */}
        <View style={styles.topSection}>
          <Text style={styles.logo}>E</Text>

          <Text style={styles.title}>
            Welcome to{" "}
            <Text style={styles.highlight}>EnQuire</Text>
          </Text>

          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>
        </View>

        {/* 🔥 CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#1c1c1e" : "#fff" },
          ]}
        >
          {/* 📱 Phone Input */}
          <View style={styles.inputBox}>
            <Text style={styles.country}>🇮🇳 +91</Text>
            <TextInput
              placeholder="Enter mobile number"
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              style={[
                styles.input,
                { color: isDark ? "#fff" : "#000" },
              ]}
            />
          </View>

          {/* 🎁 Promo Toggle */}
          <TouchableOpacity onPress={() => setShowPromo(!showPromo)}>
            <Text style={styles.promoText}>
              + Add Promocode (optional)
            </Text>
          </TouchableOpacity>

          {/* 🎟 Promo Input */}
          {showPromo && (
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Enter referral code"
                placeholderTextColor={isDark ? "#aaa" : "#999"}
                value={promoCode}
                onChangeText={setPromoCode}
                style={[
                  styles.input,
                  { color: isDark ? "#fff" : "#000" },
                ]}
              />
            </View>
          )}

          {/* 🔘 BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Continue Securely
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 📄 TERMS */}
        <Text style={styles.terms}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms & Conditions</Text>
        </Text>


        {/* 🔥 EMAIL LOGIN */}
<TouchableOpacity
  style={styles.emailBtn}
  onPress={() => navigation.navigate("EmailLogin")}
>
  <Text style={styles.emailText}>
    Login with Email & Password
  </Text>
</TouchableOpacity>

{/* 🔥 CREATE ACCOUNT */}
<TouchableOpacity
  onPress={() => navigation.navigate("Signup")}
>
  <Text style={styles.createAccount}>
    Create Account
  </Text>
</TouchableOpacity>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },

  highlight: {
    color: "#ffe082",
  },

  subtitle: {
    color: "#eee",
    marginTop: 5,
  },

  card: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 8,
  },

  inputBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },

  country: {
    marginRight: 10,
    fontSize: 16,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  promoText: {
    textAlign: "center",
    color: "#4facfe",
    marginBottom: 10,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  terms: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#eee",
  },

  link: {
    color: "#ffe082",
    fontWeight: "600",
  },

  emailBtn: {
  marginTop: 15,
  alignItems: "center",
},

emailText: {
  color: "#4facfe",
  fontWeight: "600",
},

createAccount: {
  textAlign: "center",
  marginTop: 15,
  color: "#fff",
  fontWeight: "600",
},
});