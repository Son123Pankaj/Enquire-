import React, { useState } from "react";
import {
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
import { showToast } from "../utils/toast";

export default function DeleteAccountFeedback({ navigation, route }) {
  const reason = route?.params?.reason || "Other";
  const [feedback, setFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeletePress = () => {
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!password.trim()) {
      showToast("Please enter your current password");
      return;
    }

    setModalVisible(false);
    setPassword("");
    showToast("Delete account functionality will be enabled soon");
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
        <Text style={styles.headerTitle}>Delete account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Reason</Text>
        <Text style={styles.reasonValue}>{reason}</Text>

        <Text style={styles.subHeading}>
          Please let us know how we can improve. Your feedback is valuable to
          us.
        </Text>

        <TextInput
          style={styles.feedbackInput}
          placeholder="Write your feedback here..."
          placeholderTextColor="#94a3b8"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
          <Text style={styles.deleteButtonText}>Delete My account</Text>
        </TouchableOpacity>

        <Text style={styles.warningText}>
          Warning: Your account may be deleted permanently. You may lose access
          to your profile, consultation records, favorites, wallet history, and
          other associated data. Please continue only if you are sure.
        </Text>
      </ScrollView>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Please enter your current password to continue.
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Current password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.modalDeleteButton}
              onPress={handleConfirmDelete}
            >
              <Text style={styles.modalDeleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  reasonValue: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 28,
  },
  subHeading: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
  },
  feedbackInput: {
    marginTop: 16,
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  deleteButton: {
    marginTop: 18,
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  warningText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 19,
    color: "#991b1b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
  },
  passwordInput: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  modalDeleteButton: {
    marginTop: 16,
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalDeleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
