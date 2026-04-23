import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getMyBusiness, updateBusiness } from "../services/business";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const afterDeduction = (value) => {
  const numericValue = toNumber(value);
  const finalAmount = numericValue - numericValue * 0.3;
  return finalAmount > 0 ? finalAmount.toFixed(2) : "0.00";
};

export default function CallRates({ navigation, route }) {
  const entryMode = route?.params?.entryMode || "direct";
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    chat_price: "",
    call_price: "",
    v_call_price: "",
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const business = await getMyBusiness();
      setBusinessId(business?.id || null);
      setForm({
        chat_price:
          business?.chat_price !== null && business?.chat_price !== undefined
            ? String(business.chat_price)
            : "",
        call_price:
          business?.call_price !== null && business?.call_price !== undefined
            ? String(business.call_price)
            : "",
        v_call_price:
          business?.v_call_price !== null && business?.v_call_price !== undefined
            ? String(business.v_call_price)
            : "",
      });
    } catch (error) {
      showToast("Unable to load consult fees");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    const normalizedValue = value.replace(/[^0-9.]/g, "");
    setForm((prev) => ({
      ...prev,
      [key]: normalizedValue,
    }));
  };

  const handleSave = async () => {
    if (!businessId) {
      showToast("Business profile not found");
      return;
    }

    try {
      setSaving(true);
      await updateBusiness(businessId, {
        business_profile: {
          chat_price: toNumber(form.chat_price),
          call_price: toNumber(form.call_price),
          v_call_price: toNumber(form.v_call_price),
        },
      });
      showToast("Consult fees updated successfully");
      if (entryMode === "step") {
        navigation.navigate("Schedule", { entryMode: "step" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showToast(extractApiError(error, "Unable to save consult fees"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Consult Fees</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.subTitle}>
        Enter professional fees for each consultation type.
      </Text>

      <View style={styles.noticeBanner}>
        <Icon name="info" size={16} color="#c2410c" />
        <Text style={styles.noticeText}>Minimum amount is ₹ 20/min.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Chat Price</Text>
        <TextInput
          style={styles.input}
          value={form.chat_price}
          onChangeText={(text) => handleChange("chat_price", text)}
          placeholder="Enter chat price"
          keyboardType="decimal-pad"
        />
        <Text style={styles.previewText}>
          You will Get ₹ {afterDeduction(form.chat_price)}
        </Text>

        <Text style={styles.label}>Call Price</Text>
        <TextInput
          style={styles.input}
          value={form.call_price}
          onChangeText={(text) => handleChange("call_price", text)}
          placeholder="Enter call price"
          keyboardType="decimal-pad"
        />
        <Text style={styles.previewText}>
          You will Get ₹ {afterDeduction(form.call_price)}
        </Text>

        <Text style={styles.label}>Online Meeting Price</Text>
        <TextInput
          style={styles.input}
          value={form.v_call_price}
          onChangeText={(text) => handleChange("v_call_price", text)}
          placeholder="Enter online meeting price"
          keyboardType="decimal-pad"
        />
        <Text style={styles.previewText}>
          You will Get ₹ {afterDeduction(form.v_call_price)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 12,
  },

  headerSpacer: {
    width: 24,
  },

  subTitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },

  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },

  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#9a3412",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#0f172a",
  },

  previewText: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748b",
  },

  saveButton: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
