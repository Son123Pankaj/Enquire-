import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getMyBusiness } from "../services/business";
import { showToast } from "../utils/toast";

const STATUS_CONFIG = {
  pending: {
    title: "Profile Under Review",
    message:
      "Your business profile has been submitted successfully and is currently pending admin approval.",
    color: "#f97316",
  },
  approved: {
    title: "Profile Approved",
    message:
      "Your business profile is approved. Customers can now discover and connect with you.",
    color: "#16a34a",
  },
  rejected: {
    title: "Profile Needs Update",
    message:
      "Your profile was rejected. Please review the comments and resubmit the required details.",
    color: "#dc2626",
  },
};

export default function Approval({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    fetchApprovalStatus();
  }, []);

  const fetchApprovalStatus = async () => {
    try {
      const currentBusiness = await getMyBusiness();
      setBusiness(currentBusiness);
    } catch (error) {
      showToast("Unable to load approval status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const approvalStatus = business?.approval_status || "pending";
  const statusConfig = STATUS_CONFIG[approvalStatus] || STATUS_CONFIG.pending;
  const statusIcon = approvalStatus === "approved" ? "check-circle" : "clock";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${statusConfig.color}18` }]}>
          <Icon name={statusIcon} size={30} color={statusConfig.color} />
        </View>

        <Text style={styles.title}>{statusConfig.title}</Text>
        <Text style={styles.message}>{statusConfig.message}</Text>

        <View style={[styles.statusChip, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusChipText}>
            {approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
          </Text>
        </View>

        {business?.rejection_reason ? (
          <Text style={styles.reasonText}>
            Reason: {business.rejection_reason}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("BusinessDetails")}
        >
          <Text style={styles.primaryButtonText}>Open Business Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 18,
    justifyContent: "center",
  },

  header: {
    position: "absolute",
    top: 18,
    left: 18,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },

  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
  },

  statusChip: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  statusChipText: {
    color: "#fff",
    fontWeight: "700",
  },

  reasonText: {
    marginTop: 14,
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
  },

  primaryButton: {
    marginTop: 24,
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: "stretch",
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
