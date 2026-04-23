import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const reasons = [
  "I don't want to use Enquire anymore",
  "I'm using a different account",
  "I'm worried about my privacy",
  "You are sending me too many emails/notifications",
  "This app is not working properly",
  "Other",
];

export default function DeleteAccountReasons({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.container}>
        <Text style={styles.heading}>
          Why would you like to delete your account
        </Text>

        <View style={styles.listCard}>
          {reasons.map((reason, index) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonRow,
                index !== reasons.length - 1 && styles.reasonBorder,
              ]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("DeleteAccountFeedback", { reason })
              }
            >
              <Text style={styles.reasonText}>{reason}</Text>
              <Icon name="chevron-right" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    padding: 18,
  },
  heading: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 18,
  },
  listCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  reasonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  reasonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    paddingRight: 12,
  },
});
