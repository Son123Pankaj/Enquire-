import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import { verifyCashfreePayment } from "../services/payments";
import { extractApiError } from "../utils/apiError";

export default function PaymentStatusScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const orderId = route?.params?.order_id || route?.params?.orderId;
  const [loading, setLoading] = useState(true);
  const [statusResult, setStatusResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (orderId) {
      checkStatus();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await verifyCashfreePayment(orderId);
      setStatusResult(res);
    } catch (error) {
      setErrorMessage(extractApiError(error, "Unable to verify payment status"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToWallet = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainApp" }],
    });
    navigation.navigate("Wallet");
  };

  const handleRetryPayment = () => {
    navigation.navigate("WalletTopup");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Verifying payment status...</Text>
          <Text style={styles.loadingSub}>Please do not close the app</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSuccess = statusResult?.status === "success";
  const isFailed = statusResult?.status === "failed" || Boolean(errorMessage);
  const amountRupees = statusResult?.amount_cents
    ? (statusResult.amount_cents / 100).toFixed(2)
    : "0.00";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isSuccess ? (
          <View style={styles.card}>
            <View style={styles.successIconWrap}>
              <Icon name="check-circle" size={56} color="#16a34a" />
            </View>

            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>
              Your payment has been verified and your wallet has been credited successfully.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Amount Credited:</Text>
                <Text style={styles.detailValGreen}>₹{amountRupees}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Order ID:</Text>
                <Text style={styles.detailVal}>{orderId || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Status:</Text>
                <Text style={styles.detailValGreen}>PAID & CREDITED</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleGoToWallet}>
              <Text style={styles.primaryBtnText}>Go to Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : isFailed ? (
          <View style={styles.card}>
            <View style={styles.failIconWrap}>
              <Icon name="alert-circle" size={56} color="#dc2626" />
            </View>

            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.subtitle}>
              {errorMessage ||
                statusResult?.message ||
                "Your transaction could not be completed or was cancelled."}
            </Text>

            {orderId ? (
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Order ID:</Text>
                  <Text style={styles.detailVal}>{orderId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Status:</Text>
                  <Text style={styles.detailValRed}>FAILED / CANCELLED</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRetryPayment}>
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoToWallet}>
              <Text style={styles.secondaryBtnText}>Back to Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.pendingIconWrap}>
              <Icon name="clock" size={56} color="#f59e0b" />
            </View>

            <Text style={styles.title}>Payment Verification Pending</Text>
            <Text style={styles.subtitle}>
              We are checking your payment status with the payment gateway. Wallet balance will update automatically once verified.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Order ID:</Text>
                <Text style={styles.detailVal}>{orderId || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Status:</Text>
                <Text style={styles.detailValOrange}>PENDING VERIFICATION</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={checkStatus}>
              <Text style={styles.primaryBtnText}>Refresh Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoToWallet}>
              <Text style={styles.secondaryBtnText}>Back to Wallet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 16, fontSize: 18, fontWeight: "700", color: "#0f172a" },
  loadingSub: { marginTop: 6, fontSize: 13, color: "#64748b" },
  content: { flex: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center" },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  failIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  pendingIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22 },
  detailsBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailKey: { color: "#64748b", fontSize: 13 },
  detailVal: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  detailValGreen: { color: "#16a34a", fontWeight: "700", fontSize: 14 },
  detailValRed: { color: "#dc2626", fontWeight: "700", fontSize: 14 },
  detailValOrange: { color: "#f59e0b", fontWeight: "700", fontSize: 14 },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryBtn: { width: "100%", paddingVertical: 14, alignItems: "center", marginTop: 8 },
  secondaryBtnText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
});
