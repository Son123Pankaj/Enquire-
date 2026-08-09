import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { fetchWalletTransactions } from "../services/payments";
import {
  cancelWithdrawalRequest,
  createWithdrawalRequest,
  getWithdrawalRequests,
} from "../services/earnings";
import { getProfile } from "../services/profile";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

export default function WalletScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedTab, setSelectedTab] = useState("All");
  const [walletBalanceCents, setWalletBalanceCents] = useState(0);
  const [earningsBalanceCents, setEarningsBalanceCents] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);

  // Withdrawal modal state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadWallet();
    }
  }, [isFocused]);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [walletResponse, earningsResponse, profile] = await Promise.all([
        fetchWalletTransactions(),
        getWithdrawalRequests(),
        getProfile(),
      ]);

      setWalletBalanceCents(walletResponse.walletBalanceCents);
      setTransactions(walletResponse.walletTransactions || []);
      setEarningsBalanceCents(earningsResponse.earningsBalanceCents ?? 0);
      setWithdrawalRequests(earningsResponse.withdrawalRequests || []);
      setIsBusiness(Boolean(profile?.is_business));
    } catch (error) {
      showToast("Unable to load wallet details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = () => navigation.navigate("WalletTopup");

  const openWithdrawModal = () => {
    setWithdrawAmount("");
    setUpiId("");
    setWithdrawModalVisible(true);
  };

  const numAmount = Number(withdrawAmount) || 0;
  const deductionAmount = numAmount * 0.2;
  const netAmount = Math.max(0, numAmount - deductionAmount);

  const handleSubmitWithdrawal = async () => {
    if (numAmount <= 0) {
      showToast("Please enter a valid withdrawal amount");
      return;
    }

    const earningsBalanceInRupees = earningsBalanceCents / 100;
    if (numAmount > earningsBalanceInRupees) {
      showToast(`Amount exceeds your earnings balance (₹${earningsBalanceInRupees.toFixed(2)})`);
      return;
    }

    if (!upiId || !upiId.includes("@")) {
      showToast("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }

    try {
      setSubmittingWithdrawal(true);
      const amountCents = Math.round(numAmount * 100);
      await createWithdrawalRequest(amountCents, upiId.trim());
      showToast("Withdrawal request submitted successfully!");
      setWithdrawModalVisible(false);
      loadWallet();
    } catch (error) {
      showToast(extractApiError(error, "Failed to submit withdrawal request"));
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleCancelWithdrawal = async (id) => {
    try {
      await cancelWithdrawalRequest(id);
      showToast("Withdrawal request cancelled");
      loadWallet();
    } catch (error) {
      showToast(extractApiError(error, "Unable to cancel request"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Header Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Total Balance</Text>

          <View style={styles.balanceRow}>
            <Text style={styles.balance}>₹{(walletBalanceCents / 100).toFixed(2)}</Text>

            <TouchableOpacity style={styles.addBtn} onPress={handleAddMoney}>
              <Text style={styles.addBtnText}>+ Add Money</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletRow}>
            <View style={styles.walletBox}>
              <Text style={styles.walletTitle}>Cash Wallet</Text>
              <Text style={styles.walletAmount}>₹{(walletBalanceCents / 100).toFixed(2)}</Text>
              <Text style={styles.walletSub}>Spent on consultations</Text>
            </View>

            <View style={styles.circle}>
              <Icon name="arrow-right" size={18} color="#64748b" />
            </View>

            <View style={styles.walletBox}>
              <Text style={styles.walletTitle}>Earnings Wallet</Text>
              <Text style={styles.walletAmount}>₹{(earningsBalanceCents / 100).toFixed(2)}</Text>
              {isBusiness ? (
                <TouchableOpacity style={styles.withdrawSmallBtn} onPress={openWithdrawModal}>
                  <Text style={styles.withdrawSmallBtnText}>Withdraw</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.walletSub}>Withdrawable for experts</Text>
              )}
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>

          <View style={styles.tabRow}>
            {["All", "Cash", "Earnings"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBtn,
                  selectedTab === tab && styles.activeTab,
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {transactions
              .filter((item) => {
                if (selectedTab === "All") return true;
                return item.entry_type?.toLowerCase().includes(selectedTab.toLowerCase());
              })
              .map((item) => (
                <View key={String(item.id)} style={styles.transactionCard}>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionTitle}>{item.description}</Text>
                    <Text style={[styles.transactionAmount, item.transaction_type === "credit" ? styles.creditText : styles.debitText]}>
                      {item.transaction_type === "credit" ? "+" : "-"}
                      ₹{((item.amount_cents ?? 0) / 100).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.transactionMeta}>{item.created_at}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Expert Withdrawal Requests List */}
        {isBusiness && !loading && (
          <View style={styles.withdrawalSection}>
            <View style={styles.withdrawalHeaderRow}>
              <Text style={styles.sectionTitle}>Withdrawal Requests</Text>
              <TouchableOpacity style={styles.requestNewBtn} onPress={openWithdrawModal}>
                <Icon name="plus" size={14} color="#fff" />
                <Text style={styles.requestNewBtnText}>Request Payout</Text>
              </TouchableOpacity>
            </View>

            {withdrawalRequests.length === 0 ? (
              <View style={styles.emptyWithdrawal}>
                <Text style={styles.emptyText}>No withdrawal requests submitted yet</Text>
              </View>
            ) : (
              withdrawalRequests.map((item) => {
                const reqAmount = item.amount || (item.amount_cents || 0) / 100;
                const netPayout = item.net_amount || reqAmount * 0.8;
                const feeCut = item.deduction_amount || reqAmount * 0.2;

                return (
                  <View key={String(item.id)} style={styles.withdrawalCard}>
                    <View style={styles.transactionRow}>
                      <View>
                        <Text style={styles.transactionTitle}>UPI: {item.upi_id || "N/A"}</Text>
                        <Text style={styles.deductionSubText}>
                          Req: ₹{reqAmount.toFixed(2)} | Fee (20%): -₹{feeCut.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              item.status === "pending"
                                ? "#f59e0b"
                                : item.status === "approved" || item.status === "completed"
                                ? "#16a34a"
                                : "#dc2626",
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{item.status?.toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.netPayoutRow}>
                      <Text style={styles.netPayoutLabel}>Net Amount to Receive:</Text>
                      <Text style={styles.netPayoutVal}>₹{netPayout.toFixed(2)}</Text>
                    </View>

                    <View style={styles.withdrawalMetaRow}>
                      <Text style={styles.transactionMeta}>
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>

                      {item.status === "pending" && (
                        <TouchableOpacity onPress={() => handleCancelWithdrawal(item.id)}>
                          <Text style={styles.cancelLinkText}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Withdrawal Request Modal */}
      <Modal
        transparent
        visible={withdrawModalVisible}
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Earnings Payout</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Icon name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Notice Message */}
            <View style={styles.noticeBox}>
              <Icon name="alert-circle" size={18} color="#9a3412" />
              <Text style={styles.noticeText}>
                You will get amount after 20% deduction
              </Text>
            </View>

            <Text style={styles.inputLabel}>UPI ID (for receiving payout)</Text>
            <TextInput
              style={styles.textInput}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. name@upi or mobile@paytm"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
            <TextInput
              style={styles.textInput}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="Enter amount (e.g. 500)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />

            {/* Breakdown Card */}
            {numAmount > 0 && (
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>Requested Amount:</Text>
                  <Text style={styles.breakdownVal}>₹{numAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>Platform Fee (20%):</Text>
                  <Text style={styles.breakdownValRed}>-₹{deductionAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKeyBold}>Net Amount to Receive:</Text>
                  <Text style={styles.breakdownValGreen}>₹{netAmount.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleSubmitWithdrawal}
              disabled={submittingWithdrawal}
            >
              {submittingWithdrawal ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitModalBtnText}>Submit Payout Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 24,
    elevation: 2,
  },
  label: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  balance: { fontSize: 30, fontWeight: "700", color: "#0f172a" },
  addBtn: {
    backgroundColor: "#f97316",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
  },
  walletBox: { flex: 1 },
  walletTitle: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  walletAmount: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginVertical: 2 },
  walletSub: { fontSize: 11, color: "#94a3b8" },
  withdrawSmallBtn: {
    marginTop: 4,
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  withdrawSmallBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  transactionHeader: { marginHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  tabRow: { flexDirection: "row", marginTop: 10 },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    marginRight: 8,
  },
  activeTab: { backgroundColor: "#f97316" },
  tabText: { color: "#475569", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#fff", fontWeight: "700" },
  loadingContainer: { paddingVertical: 40, alignItems: "center" },
  emptyContainer: { paddingVertical: 30, alignItems: "center" },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  listSection: { paddingHorizontal: 16, marginTop: 12 },
  transactionCard: {
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
  },
  transactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  transactionTitle: { fontSize: 14, color: "#0f172a", fontWeight: "600", flex: 1 },
  transactionAmount: { fontSize: 15, fontWeight: "700" },
  creditText: { color: "#16a34a" },
  debitText: { color: "#dc2626" },
  transactionMeta: { marginTop: 4, color: "#64748b", fontSize: 12 },
  withdrawalSection: { marginTop: 24, paddingHorizontal: 16 },
  withdrawalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  requestNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  requestNewBtnText: { color: "#fff", fontWeight: "700", fontSize: 12, marginLeft: 4 },
  emptyWithdrawal: { backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  withdrawalCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 12 },
  deductionSubText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  netPayoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  netPayoutLabel: { fontSize: 12, color: "#166534", fontWeight: "600" },
  netPayoutVal: { fontSize: 15, color: "#15803d", fontWeight: "700" },
  withdrawalMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  cancelLinkText: { color: "#dc2626", fontWeight: "700", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: { marginLeft: 8, flex: 1, color: "#9a3412", fontWeight: "700", fontSize: 13 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6, marginTop: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    fontSize: 14,
  },
  breakdownCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  breakdownKey: { color: "#64748b", fontSize: 13 },
  breakdownVal: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  breakdownValRed: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
  breakdownDivider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 6 },
  breakdownKeyBold: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
  breakdownValGreen: { color: "#16a34a", fontWeight: "700", fontSize: 15 },
  submitModalBtn: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  submitModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});