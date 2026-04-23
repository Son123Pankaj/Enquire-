import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getCategories } from "../services/category";
import { getMyBusiness, updateBusiness } from "../services/business";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const MAX_SELECTION = 15;

export default function Category({ navigation, route }) {
  const entryMode = route?.params?.entryMode || "direct";
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScreenData();
  }, []);

  const fetchScreenData = async () => {
    try {
      setLoading(true);
      const [allCategories, myBusiness] = await Promise.all([
        getCategories(),
        getMyBusiness(),
      ]);

      setCategories(Array.isArray(allCategories) ? allCategories : []);
      setBusinessId(myBusiness?.id || null);
      setSelectedIds(
        Array.isArray(myBusiness?.categories)
          ? myBusiness.categories.map((item) => item.id)
          : []
      );
    } catch (error) {
      showToast("Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const alreadySelected = selectedIds.includes(categoryId);

    if (alreadySelected) {
      setSelectedIds((prev) => prev.filter((id) => id !== categoryId));
      return;
    }

    if (selectedIds.length >= MAX_SELECTION) {
      return;
    }

    setSelectedIds((prev) => [...prev, categoryId]);
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
          category_ids: selectedIds,
        },
      });
      showToast("Categories updated successfully");
      if (entryMode === "step") {
        navigation.navigate("CallRates", { entryMode: "step" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showToast(extractApiError(error, "Unable to save categories"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          You can choose upto 15 Categories
        </Text>
        <Text style={styles.countText}>
          {selectedIds.length}/{MAX_SELECTION} selected
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((item) => {
          const checked = selectedIds.includes(item.id);
          const disabled = !checked && selectedIds.length >= MAX_SELECTION;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, disabled && styles.rowDisabled]}
              activeOpacity={0.8}
              disabled={disabled}
              onPress={() => toggleCategory(item.id)}
            >
              <Text style={[styles.rowText, disabled && styles.rowTextDisabled]}>
                {item.name}
              </Text>

              <View
                style={[
                  styles.checkbox,
                  checked && styles.checkboxActive,
                  disabled && styles.checkboxDisabled,
                ]}
              >
                {checked && <Icon name="check" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  infoText: {
    fontSize: 14,
    color: "#475569",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },

  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f97316",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  row: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowDisabled: {
    opacity: 0.55,
  },

  rowText: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
    paddingRight: 14,
  },

  rowTextDisabled: {
    color: "#64748b",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  checkboxActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },

  checkboxDisabled: {
    backgroundColor: "#f1f5f9",
  },

  saveButton: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
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
