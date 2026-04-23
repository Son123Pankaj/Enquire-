import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { hasNativeActions, pickPdfDocument } from "../native/nativeActions";
import {
  createBusiness,
  getMyBusiness,
  updateBusiness,
} from "../services/business";
import { extractApiError } from "../utils/apiError";
import { getAddressByPincode } from "../services/pincode";
import { showToast } from "../utils/toast";

const MAX_GST_CERTIFICATE_SIZE = 2 * 1024 * 1024;

const sanitizePdfFileName = (name) => {
  const baseName = String(name || "")
    .trim()
    .replace(/[^\w.-]/g, "_")
    .replace(/\.+/g, ".");

  if (!baseName) {
    return `gst-certificate-${Date.now()}.pdf`;
  }

  return baseName.toLowerCase().endsWith(".pdf") ? baseName : `${baseName}.pdf`;
};

export default function BusinessDetails({ navigation, route }) {
  const entryMode = route?.params?.entryMode || "direct";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [gstCertificate, setGstCertificate] = useState(null);
  const [form, setForm] = useState({
    business_name: "",
    business_address: "",
    bio: "",
    about: "",
    gst_enabled: false,
    gst_number: "",
    pincode: "",
    state: "",
    city: "",
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const business = await getMyBusiness();
      setBusinessId(business?.id || null);
      setForm({
        business_name: business?.business_name || "",
        business_address: business?.business_address || "",
        bio: business?.bio || "",
        about: business?.about || "",
        gst_enabled: Boolean(business?.gst_enabled),
        gst_number: business?.gst_number || "",
        pincode: business?.pincode ? String(business.pincode) : "",
        state: business?.state || "",
        city: business?.city || "",
      });
      if (business?.gst_certificate?.url || business?.gst_certificate_url) {
        const certificate = business?.gst_certificate || {};
        setGstCertificate({
          uri: certificate.url || business.gst_certificate_url,
          fileName: certificate.filename || "gst-certificate.pdf",
          type: certificate.content_type || "application/pdf",
          fileSize: certificate.byte_size || 0,
          isRemote: true,
        });
      }
    } catch (error) {
      showToast(extractApiError(error, "Unable to load business details"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePincodeChange = async (value) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    handleChange("pincode", numericValue);

    if (numericValue.length !== 6) {
      return;
    }

    try {
      setPincodeLoading(true);
      const address = await getAddressByPincode(numericValue);
      setForm((prev) => ({
        ...prev,
        pincode: numericValue,
        state: address.state,
        city: address.city,
      }));
    } catch (error) {
      showToast("Unable to fetch city and state");
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateGstCertificate = (asset) => {
    const fileName = sanitizePdfFileName(asset?.fileName);
    const extension = fileName.toLowerCase().split(".").pop();
    const contentType = String(asset?.type || "").toLowerCase();

    if (extension !== "pdf") {
      return "GST certificate must use .pdf format";
    }

    if (contentType && contentType !== "application/pdf") {
      return "GST certificate must be a PDF document";
    }

    if (asset?.fileSize && asset.fileSize > MAX_GST_CERTIFICATE_SIZE) {
      return "GST certificate must be 2 MB or smaller";
    }

    return null;
  };

  const handleCertificatePick = async () => {
    try {
      if (Platform.OS === "android" && !hasNativeActions) {
        showToast("Unable to open PDF file picker right now.");
        return;
      }

      const asset = await pickPdfDocument();

      if (!asset) {
        return;
      }

      if (!asset?.uri) {
        showToast("Please select a valid PDF file.");
        return;
      }

      const validationMessage = validateGstCertificate(asset);

      if (validationMessage) {
        showToast(validationMessage);
        return;
      }

      setGstCertificate({
        uri: asset.uri,
        fileName: sanitizePdfFileName(asset.fileName),
        type: "application/pdf",
        fileSize: asset.fileSize || 0,
      });

    } catch (error) {
      showToast("Unable to select GST certificate.");
    }
  };

  const handleSave = async () => {
    if (!form.business_name.trim() || !form.business_address.trim()) {
      showToast("Business name and address are required");
      return;
    }

    if (
      form.gst_enabled &&
      (!form.gst_number.trim() ||
        !form.pincode.trim() ||
        !form.state.trim() ||
        !form.city.trim())
    ) {
      showToast("Please complete GST details");
      return;
    }

    if (form.gst_enabled && gstCertificate?.uri && !gstCertificate?.isRemote) {
      const validationMessage = validateGstCertificate(gstCertificate);

      if (validationMessage) {
        showToast(validationMessage);
        return;
      }
    }

    try {
      setSaving(true);
      const useMultipart = gstCertificate?.uri && !gstCertificate?.isRemote;
      let response;

      if (useMultipart) {
        const payload = new FormData();
        payload.append("business_profile[business_name]", form.business_name.trim());
        payload.append(
          "business_profile[business_address]",
          form.business_address.trim()
        );
        payload.append("business_profile[bio]", form.bio.trim());
        payload.append("business_profile[about]", form.about.trim());
        payload.append("business_profile[gst_enabled]", String(form.gst_enabled));
        payload.append(
          "business_profile[gst_number]",
          form.gst_enabled ? form.gst_number.trim() : ""
        );
        payload.append(
          "business_profile[pincode]",
          form.gst_enabled ? form.pincode.trim() : ""
        );
        payload.append(
          "business_profile[state]",
          form.gst_enabled ? form.state.trim() : ""
        );
        payload.append(
          "business_profile[city]",
          form.gst_enabled ? form.city.trim() : ""
        );
        payload.append("business_profile[gst_certificate]", {
          uri: gstCertificate.uri,
          name: sanitizePdfFileName(gstCertificate.fileName),
          type: "application/pdf",
        });

        response = businessId
          ? await updateBusiness(businessId, payload)
          : await createBusiness(payload);
      } else {
        const payload = {
          business_profile: {
            business_name: form.business_name.trim(),
            business_address: form.business_address.trim(),
            bio: form.bio.trim(),
            about: form.about.trim(),
            gst_enabled: form.gst_enabled,
            gst_number: form.gst_enabled ? form.gst_number.trim() : "",
            pincode: form.gst_enabled ? form.pincode.trim() : "",
            state: form.gst_enabled ? form.state.trim() : "",
            city: form.gst_enabled ? form.city.trim() : "",
          },
        };

        response = businessId
          ? await updateBusiness(businessId, payload)
          : await createBusiness(payload);
      }

      showToast(response?.message || "Business details saved");
      if (entryMode === "step") {
        navigation.navigate("Category", { entryMode: "step" });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showToast(extractApiError(error, "Unable to save business details"));
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { label: "Step 3: Categories", screen: "Category" },
    { label: "Step 4: Consult Fees", screen: "CallRates" },
    { label: "Step 5: Schedule", screen: "Schedule" },
    { label: "Approval Status", screen: "Approval" },
  ];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Business Details</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Step 1: Basic Business Information</Text>

        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          value={form.business_name}
          onChangeText={(text) => handleChange("business_name", text)}
          placeholder="Enter business name"
        />

        <Text style={styles.label}>Business Address</Text>
        <TextInput
          style={styles.input}
          value={form.business_address}
          onChangeText={(text) => handleChange("business_address", text)}
          placeholder="Enter business address"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.input}
          value={form.bio}
          onChangeText={(text) => handleChange("bio", text)}
          placeholder="Short business bio"
          maxLength={160}
        />

        <Text style={styles.label}>About</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.about}
          onChangeText={(text) => handleChange("about", text)}
          placeholder="Tell users more about your services"
          multiline
        />
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleContent}>
            <Text style={styles.sectionTitle}>Step 2: GST Details</Text>
            <Text style={styles.helperText}>
              Turn this on if you want to add GST information.
            </Text>
          </View>
          <Switch
            value={form.gst_enabled}
            onValueChange={(value) => handleChange("gst_enabled", value)}
            trackColor={{ false: "#cbd5e1", true: "#f97316" }}
            thumbColor="#fff"
          />
        </View>

        {form.gst_enabled && (
          <>
            <Text style={styles.label}>GST Number</Text>
            <TextInput
              style={styles.input}
              value={form.gst_number}
              onChangeText={(text) => handleChange("gst_number", text.toUpperCase())}
              placeholder="Enter GST number"
              autoCapitalize="characters"
            />

            <Text style={styles.label}>GST Certificate</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleCertificatePick}
            >
              <Icon name="upload" size={16} color="#f97316" />
              <Text style={styles.uploadButtonText}>
                {gstCertificate?.fileName || "Upload GST Certificate"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Pincode</Text>
            <View style={styles.inlineRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                value={form.pincode}
                onChangeText={handlePincodeChange}
                placeholder="Enter pincode"
                keyboardType="number-pad"
                maxLength={6}
              />
              {pincodeLoading ? (
                <ActivityIndicator size="small" color="#f97316" style={styles.loaderInline} />
              ) : null}
            </View>

            <Text style={styles.label}>State</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={form.state}
              editable={false}
              placeholder="State"
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={form.city}
              editable={false}
              placeholder="City"
            />
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Business Details</Text>
        )}
      </TouchableOpacity>

      <View style={styles.stepLinks}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step.screen}
            style={styles.stepCard}
            onPress={() => navigation.navigate(step.screen, { entryMode: "step" })}
          >
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Icon name="chevron-right" size={18} color="#475569" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 18,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    marginLeft: 12,
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },

  helperText: {
    fontSize: 12,
    color: "#64748b",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
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

  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toggleContent: {
    flex: 1,
  },

  inlineRow: {
    justifyContent: "center",
  },

  flexInput: {
    paddingRight: 36,
  },

  loaderInline: {
    position: "absolute",
    right: 12,
  },

  disabledInput: {
    backgroundColor: "#eef2f7",
    color: "#64748b",
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#fdba74",
    borderRadius: 14,
    backgroundColor: "#fff7ed",
  },

  uploadButtonText: {
    marginLeft: 8,
    color: "#9a3412",
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#f97316",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  stepLinks: {
    gap: 12,
  },

  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
