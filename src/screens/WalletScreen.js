import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { fetchWalletTransactions } from "../services/payments";
import { getWithdrawalRequests } from "../services/earnings";
import { showToast } from "../utils/toast";

export default function WalletScreen() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("All");
  const [walletBalanceCents, setWalletBalanceCents] = useState(0);
  const [earningsBalanceCents, setEarningsBalanceCents] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [walletResponse, earningsResponse] = await Promise.all([
        fetchWalletTransactions(),
        getWithdrawalRequests(),
      ]);

      setWalletBalanceCents(walletResponse.walletBalanceCents);
      setTransactions(walletResponse.walletTransactions || []);
      setEarningsBalanceCents(earningsResponse.earningsBalanceCents ?? 0);
      setWithdrawalRequests(earningsResponse.withdrawalRequests || []);
    } catch (error) {
      showToast("Unable to load wallet details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = () => navigation.navigate("WalletTopup");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total balance</Text>

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
            <Text style={styles.walletSub}>Used for calls</Text>
          </View>

          <View style={styles.circle}>
            <Icon name="arrow-left" size={20} color="#000" />
          </View>

          <View style={styles.walletBox}>
            <Text style={styles.walletTitle}>Earnings Wallet</Text>
            <Text style={styles.walletAmount}>₹{(earningsBalanceCents / 100).toFixed(2)}</Text>
            <Text style={styles.walletSub}>Withdraw / Transfer</Text>
          </View>
        </View>
      </View>

      {/* Transactions */}
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
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={transactions.filter((item) => {
            if (selectedTab === "All") return true;
            return item.entry_type?.toLowerCase().includes(selectedTab.toLowerCase());
          })}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <Text style={styles.transactionTitle}>{item.description}</Text>
                <Text style={styles.transactionAmount}>
                  {item.transaction_type === "credit" ? "+" : "-"}
                  ₹{((item.amount_cents ?? 0) / 100).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.transactionMeta}>{item.created_at}</Text>
            </View>
          )}
        />
      )}

      {!loading && (
        <View style={styles.withdrawalSection}>
          <Text style={styles.sectionTitle}>Withdrawal Requests</Text>
          {withdrawalRequests.length === 0 ? (
            <View style={styles.emptyWithdrawal}>
              <Text style={styles.emptyText}>No withdrawal requests yet</Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={withdrawalRequests}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.withdrawalCard}>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionTitle}>₹{((item.amount_cents || 0) / 100).toFixed(2)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === "pending" ? "#f59e0b" : item.status === "approved" ? "#10b981" : item.status === "rejected" ? "#ef4444" : "#3b82f6" }]}> 
                      <Text style={styles.statusBadgeText}>{item.status?.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.transactionMeta}>{item.upi_id || "UPI not available"}</Text>
                  <Text style={styles.transactionMeta}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },
  label: {
    color: "#777",
    fontSize: 14,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  balance: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  walletBox: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 13,
    color: "#777",
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  walletSub: {
    fontSize: 12,
    color: "#999",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  transactionHeader: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#111827",
  },
  tabText: {
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
  },
  withdrawalSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  withdrawalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    justifyContent: "center",
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyWithdrawal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  transactionCard: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  transactionMeta: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});