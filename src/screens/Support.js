import React from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { showToast } from "../utils/toast";

const supportTopics = [
  "Wallet top-up, balance, deductions, and transaction-related queries",
  "Chat, call, or online meeting pricing and billing concerns",
  "Favorites, notifications, profile, or access-related issues",
  "Business profile onboarding, approval, category, or schedule support",
  "Technical bugs, app crashes, slow loading, or unexpected behavior",
  "General guidance on how the app works and how to use its features",
];

const importantNotes = [
  "Support is currently handled through email only.",
  "Please email us from your registered email ID whenever possible.",
  "For payment-related concerns, include date, amount, and reference details if available.",
  "For profile or account issues, mention your registered mobile number for faster help.",
];

const legalSupportNotes = [
  "Customer support can help with platform issues, but cannot provide legal representation or guaranteed outcomes.",
  "For disputes involving tax, legal filings, or regulatory timelines, keep your own records and consult the relevant expert directly.",
  "If you believe any content violates applicable Indian law, platform safety, or your rights, report it with clear details and screenshots.",
];

export default function Support({ navigation }) {
  const handleEmailPress = async () => {
    const email = "support@previewtax.com";
    const url = `mailto:${email}`;

    try {
      const canOpen = await Linking.canOpenURL(url);

      if (!canOpen) {
        showToast("No email app found on this device");
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      showToast(error?.message || "Unable to open email app");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Need Help? We're Here to Assist</Text>
          <Text style={styles.paragraph}>
            If you face any issue while using the app, you can contact our
            support team through email. Please share the problem clearly so we
            can review it and help you as quickly as possible.
          </Text>
        </View>

        <TouchableOpacity style={styles.emailCard} onPress={handleEmailPress}>
          <View style={styles.emailIconWrap}>
            <Icon name="mail" size={20} color="#2563eb" />
          </View>
          <View style={styles.emailTextWrap}>
            <Text style={styles.emailLabel}>Email us at</Text>
            <Text style={styles.emailValue}>support@previewtax.com</Text>
            <Text style={styles.emailHint}>
              Please include your registered mobile number or email ID for
              faster assistance.
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What You Can Contact Us For</Text>
          {supportTopics.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>-</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          {importantNotes.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>-</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Icon name="alert-circle" size={18} color="#b45309" />
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>Compliance and Safety</Text>
            {legalSupportNotes.map((item) => (
              <View key={item} style={styles.noticeBulletRow}>
                <Text style={styles.noticeBullet}>-</Text>
                <Text style={styles.noticeText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  emailIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  emailTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  emailLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  emailValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  emailHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#334155",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletDot: {
    fontSize: 16,
    color: "#111827",
    marginRight: 10,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff7ed",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  noticeBody: {
    flex: 1,
    marginLeft: 10,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9a3412",
    marginBottom: 10,
  },
  noticeBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  noticeBullet: {
    fontSize: 15,
    color: "#9a3412",
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#9a3412",
    fontWeight: "600",
  },
});
