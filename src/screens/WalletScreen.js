import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

export default function WalletScreen() {
  const [selectedTab, setSelectedTab] = useState("All");

  const transactions = []; // empty for now

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total balance</Text>

        <View style={styles.balanceRow}>
          <Text style={styles.balance}>₹0.0</Text>

          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Money</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.walletRow}>
          <View style={styles.walletBox}>
            <Text style={styles.walletTitle}>Cash Wallet</Text>
            <Text style={styles.walletAmount}>₹0.0</Text>
            <Text style={styles.walletSub}>Used for calls</Text>
          </View>

          <View style={styles.circle}>
            <Icon name="arrow-left" size={20} color="#000" />
          </View>

          <View style={styles.walletBox}>
            <Text style={styles.walletTitle}>Earnings Wallet</Text>
            <Text style={styles.walletAmount}>₹0.0</Text>
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

      {/* Empty State */}
      {transactions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      )}

      {/* Bottom Navigation (UI only) */}
      {/* <View style={styles.bottomNav}>
        <Icon name="home" size={22} />
        <Icon name="clock" size={22} />
        <Icon name="credit-card" size={22} />
        <Icon name="user" size={22} />
      </View> */}
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});