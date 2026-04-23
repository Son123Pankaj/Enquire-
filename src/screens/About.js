import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const bulletItems = [
  "Connect with verified professionals across taxation, legal, compliance, finance, and business advisory categories.",
  "Discover expert profiles with categories, ratings, reviews, pricing, and availability before you engage.",
  "Use chat, voice, and online meeting options to get guidance in a format that works best for your requirement.",
  "Save trusted experts to favorites so you can quickly reconnect whenever needed.",
];

const trustItems = [
  "Experts are expected to provide lawful, professional, and category-relevant guidance only.",
  "Users should verify critical legal, tax, or regulatory decisions with qualified professionals before implementation.",
  "Pricing, timing, availability, and final advice remain subject to the respective expert's professional judgment.",
];

const legalItems = [
  "This platform is intended to facilitate professional discovery and consultation support in India.",
  "Personal data and profile information should be shared only as needed for legitimate service delivery.",
  "Users must not upload unlawful, misleading, defamatory, or fraudulent content while using the app.",
  "Tax, GST, corporate, or regulatory guidance may vary based on facts, state rules, and changing Indian laws.",
];

export default function About({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>About Preview Tax</Text>
          <Text style={styles.paragraph}>
            Preview Tax is a professional consultation marketplace designed to help
            people and businesses in India connect with the right experts more
            quickly and confidently.
          </Text>
          <Text style={styles.paragraph}>
            The platform is built to create a reliable bridge between users who
            need guidance and professionals who offer practical support in their
            area of expertise.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What You Can Do Here</Text>
          {bulletItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>-</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trust and Quality</Text>
          {trustItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>-</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Important Legal Notes</Text>
          {legalItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>-</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Icon name="shield" size={18} color="#b45309" />
          <Text style={styles.noticeText}>
            For high-impact matters like tax filings, litigation strategy,
            contracts, or financial compliance, always review the final advice
            carefully and retain supporting records as per applicable Indian
            laws and regulatory requirements.
          </Text>
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
    marginBottom: 10,
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
  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: "#9a3412",
    fontWeight: "600",
  },
});
