import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import {
  forgotPassword,
  confirmForgotPasswordOtp,
  resetPassword,
  extractApiError,
} from "../services/auth";
import { showToast } from "../utils/toast";

const steps = {
  EMAIL: "EMAIL",
  OTP: "OTP",
  RESET: "RESET",
};

const stepOrder = [steps.EMAIL, steps.OTP, steps.RESET];
const stepLabels = {
  [steps.EMAIL]: "Email",
  [steps.OTP]: "OTP",
  [steps.RESET]: "Password",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(steps.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [secure, setSecure] = useState({
    password: true,
    confirmPassword: true,
  });

  const normalizedEmail = email.trim().toLowerCase();
  const activeStepIndex = stepOrder.indexOf(step);

  const stepSummary = useMemo(() => {
    if (step === steps.EMAIL) {
      return {
        eyebrow: "Recover account",
        title: "Reset your password",
        subtitle: "Enter your email and we will send a one-time code.",
        buttonText: "Send OTP",
      };
    }

    if (step === steps.OTP) {
      return {
        eyebrow: "Verify email",
        title: "Enter the OTP",
        subtitle: "Use the code sent to your registered email address.",
        buttonText: "Verify OTP",
      };
    }

    return {
      eyebrow: "Create password",
      title: "Set a new password",
      subtitle: "Choose a secure password for your account.",
      buttonText: "Reset password",
    };
  }, [step]);

  const updateError = (field, value = "") => {
    setErrors((prev) => ({
      ...prev,
      [field]: value,
      form: "",
    }));
  };

  const validateEmailStep = () => {
    const nextErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateOtpStep = () => {
    const nextErrors = {};

    if (!otp.trim()) {
      nextErrors.otp = "OTP is required";
    } else if (otp.trim().length < 4) {
      nextErrors.otp = "Enter a valid OTP";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateResetStep = () => {
    const nextErrors = {};

    if (!password.trim()) {
      nextErrors.password = "New password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmailStep()) {
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword(normalizedEmail);
      showToast(response?.message || "OTP sent successfully");
      setStep(steps.OTP);
    } catch (error) {
      const message = extractApiError(error, "Unable to send OTP");
      setErrors({ form: message });
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtpStep()) {
      return;
    }

    try {
      setLoading(true);
      const response = await confirmForgotPasswordOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });
      setResetToken(response?.reset_password_token || "");
      setStep(steps.RESET);
      showToast(response?.message || "OTP verified successfully");
    } catch (error) {
      const message = extractApiError(error, "Invalid or expired OTP");
      setErrors({ form: message });
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetStep()) {
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({
        email: normalizedEmail,
        resetPasswordToken: resetToken,
        password,
        passwordConfirmation: confirmPassword,
      });
      showToast(response?.message || "Password reset successfully");
      navigation.replace("EmailLogin");
    } catch (error) {
      const message = extractApiError(error, "Unable to reset password");
      setErrors({ form: message });
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === steps.EMAIL) {
      handleSendOtp();
      return;
    }

    if (step === steps.OTP) {
      handleVerifyOtp();
      return;
    }

    handleResetPassword();
  };

  const renderInput = ({
    icon,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry,
    onToggleSecure,
    keyboardType,
  }) => (
    <View style={styles.inputWrap}>
      <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
        <Icon name={icon} size={18} color="#94a3b8" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
        {typeof onToggleSecure === "function" ? (
          <TouchableOpacity onPress={onToggleSecure}>
            <Icon
              name={secureTextEntry ? "eye-off" : "eye"}
              size={18}
              color="#94a3b8"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const renderStepFields = () => {
    if (step === steps.EMAIL) {
      return renderInput({
        icon: "mail",
        placeholder: "Enter your email",
        value: email,
        onChangeText: (text) => {
          setEmail(text);
          updateError("email");
        },
        error: errors.email,
        keyboardType: "email-address",
      });
    }

    if (step === steps.OTP) {
      return (
        <>
          <View style={styles.infoPill}>
            <Icon name="mail" size={15} color="#ea580c" />
            <Text style={styles.infoPillText}>{normalizedEmail}</Text>
          </View>
          {renderInput({
            icon: "shield",
            placeholder: "Enter OTP",
            value: otp,
            onChangeText: (text) => {
              setOtp(text.replace(/[^0-9a-zA-Z]/g, ""));
              updateError("otp");
            },
            error: errors.otp,
          })}
        </>
      );
    }

    return (
      <>
        <View style={styles.infoPill}>
          <Icon name="mail" size={15} color="#ea580c" />
          <Text style={styles.infoPillText}>{normalizedEmail}</Text>
        </View>
        {renderInput({
          icon: "lock",
          placeholder: "Enter new password",
          value: password,
          onChangeText: (text) => {
            setPassword(text);
            updateError("password");
          },
          error: errors.password,
          secureTextEntry: secure.password,
          onToggleSecure: () =>
            setSecure((prev) => ({ ...prev, password: !prev.password })),
        })}
        {renderInput({
          icon: "lock",
          placeholder: "Confirm new password",
          value: confirmPassword,
          onChangeText: (text) => {
            setConfirmPassword(text);
            updateError("confirmPassword");
          },
          error: errors.confirmPassword,
          secureTextEntry: secure.confirmPassword,
          onToggleSecure: () =>
            setSecure((prev) => ({
              ...prev,
              confirmPassword: !prev.confirmPassword,
            })),
        })}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Image
              source={require("../../assets/preview-tax-logo-cropped.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.eyebrow}>{stepSummary.eyebrow}</Text>
            <Text style={styles.cardTitle}>{stepSummary.title}</Text>
            <Text style={styles.cardSubtitle}>{stepSummary.subtitle}</Text>

            <View style={styles.progressTrack}>
              {stepOrder.map((item, index) => {
                const isComplete = index <= activeStepIndex;
                const isCurrent = item === step;

                return (
                  <View
                    key={item}
                    style={[
                      styles.progressStep,
                      isComplete && styles.progressStepActive,
                      isCurrent && styles.progressStepCurrent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressText,
                        isComplete && styles.progressTextActive,
                      ]}
                    >
                      {stepLabels[item]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {renderStepFields()}

            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {stepSummary.buttonText}
                </Text>
              )}
            </TouchableOpacity>

            {step === steps.OTP ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("EmailLogin")}
            >
              <Text style={styles.loginLinkText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardWrap: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  hero: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    width: 180,
    height: 56,
    resizeMode: "contain",
  },
  heroTitle: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 280,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ea580c",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
  },
  progressTrack: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  progressStep: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressStepActive: {
    backgroundColor: "#fff",
    borderRadius: 16,
 },
  progressStepCurrent: {
    shadowColor: "#f97316",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  progressTextActive: {
    color: "#ea580c",
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  infoPillText: {
    marginLeft: 8,
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "600",
  },
  inputWrap: {
    marginBottom: 14,
  },
  inputBox: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
  },
  inputBoxError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 18,
  },
  loginLinkText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
});
