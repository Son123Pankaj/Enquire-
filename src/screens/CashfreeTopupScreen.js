import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createCashfreeOrder } from "../services/payments";
import { showToast } from "../utils/toast";

export default function CashfreeTopupScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Enter a valid amount to top up");
      return;
    }

    setLoading(true);
    try {
      const amountCents = Math.round(parsedAmount * 100);
      const data = await createCashfreeOrder(amountCents);

      if (!data?.payment_link) {
        throw new Error("Cashfree payment link not available");
      }

      const supported = await Linking.canOpenURL(data.payment_link);
      if (!supported) {
        throw new Error("Unable to open payment page");
      }

      await Linking.openURL(data.payment_link);
      showToast("Payment page opened. Complete the flow to top up your wallet.");
    } catch (error) {
      Alert.alert("Top-up failed", error.message || "Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.title}>Wallet Top Up</Text>
        <Text style={styles.subtitle}>
          Add funds securely in your wallet. You will be redirected to a verified checkout.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Amount (INR)</Text>
          <TextInput
            style={styles.input}
            value={String(amount)}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            placeholder="Enter amount"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity style={styles.button} onPress={handleTopUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue to pay</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to wallet</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 10,
    color: "#4b5563",
    lineHeight: 22,
  },
  card: {
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    marginTop: 18,
    alignItems: "center",
  },
  backButtonText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});
