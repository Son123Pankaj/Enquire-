import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { changePassword, extractApiError } from "../services/auth";
import { showToast } from "../utils/toast";

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function Privacy({ navigation }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [secureFields, setSecureFields] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  const passwordChecks = useMemo(
    () => ({
      hasMinLength: values.newPassword.length >= 8,
      isDifferent:
        values.currentPassword.trim().length > 0 &&
        values.newPassword !== values.currentPassword,
      matches: values.newPassword === values.confirmPassword,
    }),
    [values]
  );

  const updateField = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      form: "",
    }));
  };

  const toggleVisibility = (field) => {
    setSecureFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!values.currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required";
    }

    if (!values.newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    } else if (values.newPassword.length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters";
    } else if (values.newPassword === values.currentPassword) {
      nextErrors.newPassword =
        "New password must be different from current password";
    }

    if (!values.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (values.newPassword !== values.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(values);
      showToast(response?.message || "Password updated successfully");
      setValues(initialValues);
      setErrors({});
      setShowChangePassword(false);
    } catch (error) {
      const message = extractApiError(
        error,
        "Unable to update password right now"
      );
      setErrors((prev) => ({ ...prev, form: message }));
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (label, field, placeholder) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          errors[field] ? styles.inputBoxError : null,
        ]}
      >
        <Icon name="lock" size={18} color="#64748b" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={values[field]}
          secureTextEntry={secureFields[field]}
          onChangeText={(text) => updateField(field, text)}
        />
        <TouchableOpacity onPress={() => toggleVisibility(field)}>
          <Icon
            name={secureFields[field] ? "eye-off" : "eye"}
            size={18}
            color="#64748b"
          />
        </TouchableOpacity>
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account privacy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() => setShowChangePassword((prev) => !prev)}
        >
          <View style={styles.optionIconWrap}>
            <Icon name="lock" size={22} color="#111827" />
          </View>

          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Change password</Text>
            <Text style={styles.optionSubtitle}>
              Update your current account password
            </Text>
          </View>

          <Icon
            name={showChangePassword ? "chevron-up" : "chevron-right"}
            size={20}
            color="#94a3b8"
          />
        </TouchableOpacity>

        {showChangePassword ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Update password</Text>
            <Text style={styles.formSubtitle}>
              Use your current password to create a new secure password.
            </Text>

            {renderPasswordInput(
              "Current password",
              "currentPassword",
              "Enter current password"
            )}
            {renderPasswordInput(
              "New password",
              "newPassword",
              "Enter new password"
            )}
            {renderPasswordInput(
              "Confirm password",
              "confirmPassword",
              "Confirm new password"
            )}

            <View style={styles.validationBox}>
              <Text style={styles.validationTitle}>Password rules</Text>
              <Text
                style={[
                  styles.validationItem,
                  passwordChecks.hasMinLength && styles.validationItemSuccess,
                ]}
              >
                At least 8 characters
              </Text>
              <Text
                style={[
                  styles.validationItem,
                  passwordChecks.isDifferent && styles.validationItemSuccess,
                ]}
              >
                Different from current password
              </Text>
              <Text
                style={[
                  styles.validationItem,
                  passwordChecks.matches && styles.validationItemSuccess,
                ]}
              >
                New password and confirm password must match
              </Text>
            </View>

            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              disabled={loading}
              onPress={handleChangePassword}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Update password</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.optionCard, styles.deleteCard]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("DeleteAccountReasons")}
        >
          <View style={styles.optionIconWrap}>
            <Icon name="trash-2" size={22} color="#111827" />
          </View>

          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Request to delete account</Text>
            <Text style={styles.optionSubtitle}>
              Request to closure of your account
            </Text>
          </View>

          <Icon name="chevron-right" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>
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
    borderBottomColor: "#e9e0d5",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9e0d5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    padding: 18,
    paddingBottom: 28,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9e0d5",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  deleteCard: {
    marginTop: 14,
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  optionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#94a3b8",
  },
  formCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e9e0d5",
    padding: 18,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  formSubtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e9e0d5",
  },
  inputBoxError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: "#111827",
    fontSize: 14,
  },
  validationBox: {
    backgroundColor: "#fffaf5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  validationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  validationItem: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  validationItemSuccess: {
    color: "#15803d",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f97316",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
  },
});
