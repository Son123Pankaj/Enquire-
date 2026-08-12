import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { getProfile, submitVerification } from "../services/profile";
import { extractApiError } from "../utils/apiError";
import {
  requestCameraPermission,
  requestGalleryPermission,
} from "../utils/permissions";
import { showToast } from "../utils/toast";

const VERIFICATION_BENEFITS = [
  {
    icon: "award",
    title: "Official Orange Verification Badge",
    desc: "Eye-catching orange badge displayed on your expert profile and search cards.",
  },
  {
    icon: "trending-up",
    title: "Top Feed & Search Priority",
    desc: "Verified profiles are boosted to the top of client search and category feeds.",
  },
  {
    icon: "shield-check",
    title: "3x Client Trust & Credibility",
    desc: "Clients prefer verified experts for paid tax, financial, and legal consultations.",
  },
  {
    icon: "message-square",
    title: "Priority Consultation Inquiries",
    desc: "Receive up to 3x more direct chat, voice, and video call consultation requests.",
  },
  {
    icon: "briefcase",
    title: "Category Standout Status",
    desc: "Distinctive verified expert status separating you from non-verified listings.",
  },
  {
    icon: "clock",
    title: "28-Day Active Protection",
    desc: "Full 28-day cycle verification maintenance and priority backend support.",
  },
];

export default function Verification({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [account, setAccount] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const [documents, setDocuments] = useState({
    aadhaar_card: null,
    aadhaar_card_back: null,
    pan_card: null,
    passport_photo: null,
    education_documents: [],
  });

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const user = await getProfile();
      setAccount(user);
    } catch (error) {
      showToast(extractApiError(error, "Unable to load verification status"));
    } finally {
      setLoading(false);
    }
  };

  const openPickerModal = (targetKey) => {
    setPickerTarget(targetKey);
    setImageModalVisible(true);
  };

  const applySelectedAsset = (asset) => {
    if (!asset?.uri || !pickerTarget) {
      return;
    }

    const fileItem = {
      uri: asset.uri,
      type: asset.type || "image/jpeg",
      fileName: asset.fileName || `${pickerTarget}-${Date.now()}.jpg`,
    };

    if (pickerTarget === "education_documents") {
      setDocuments((prev) => ({
        ...prev,
        education_documents: [...prev.education_documents, fileItem],
      }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [pickerTarget]: fileItem,
      }));
    }
  };

  const pickFromCamera = async () => {
    setImageModalVisible(false);
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        showToast("Camera permission denied");
        return;
      }

      const result = await launchCamera({
        mediaType: "photo",
        quality: 0.8,
      });

      if (!result.didCancel && result.assets?.[0]) {
        applySelectedAsset(result.assets[0]);
      }
    } catch (error) {
      showToast("Unable to open camera");
    }
  };

  const pickFromGallery = async () => {
    setImageModalVisible(false);
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        showToast("Gallery permission denied");
        return;
      }

      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        selectionLimit: pickerTarget === "education_documents" ? 5 : 1,
      });

      if (!result.didCancel && result.assets?.length) {
        if (pickerTarget === "education_documents") {
          result.assets.forEach((asset) => applySelectedAsset(asset));
        } else {
          applySelectedAsset(result.assets[0]);
        }
      }
    } catch (error) {
      showToast("Unable to open gallery");
    }
  };

  const removeEducationDoc = (index) => {
    setDocuments((prev) => ({
      ...prev,
      education_documents: prev.education_documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitVerification = async () => {
    if (
      !documents.aadhaar_card ||
      !documents.aadhaar_card_back ||
      !documents.pan_card ||
      !documents.passport_photo
    ) {
      showToast("Please upload Aadhaar Front & Back, PAN Card and Passport Photo");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();

      payload.append("aadhaar_card", {
        uri: documents.aadhaar_card.uri,
        type: documents.aadhaar_card.type,
        name: documents.aadhaar_card.fileName,
      });

      payload.append("aadhaar_card_back", {
        uri: documents.aadhaar_card_back.uri,
        type: documents.aadhaar_card_back.type,
        name: documents.aadhaar_card_back.fileName,
      });

      payload.append("pan_card", {
        uri: documents.pan_card.uri,
        type: documents.pan_card.type,
        name: documents.pan_card.fileName,
      });

      payload.append("passport_photo", {
        uri: documents.passport_photo.uri,
        type: documents.passport_photo.type,
        name: documents.passport_photo.fileName,
      });

      documents.education_documents.forEach((doc, index) => {
        payload.append("education_documents[]", {
          uri: doc.uri,
          type: doc.type,
          name: doc.fileName || `education-${index}.jpg`,
        });
      });

      await submitVerification(payload);
      showToast("Verification documents submitted successfully!");
      fetchAccountData();
    } catch (error) {
      showToast(extractApiError(error, "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderVerifiedState = () => {
    const verifiedDate = account?.verified_at
      ? new Date(account.verified_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Active";
    const daysRemaining = account?.days_remaining ?? 28;

    return (
      <View style={styles.stateCard}>
        <View style={styles.verifiedIconWrap}>
          <Icon name="check-circle" size={48} color="#f97316" />
        </View>

        <Text style={styles.verifiedTitle}>Your Business Profile is Verified!</Text>
        <Text style={styles.verifiedSubtitle}>
          Your expert identity and qualifications are verified. Your profile is active with an official orange badge and boosted search placement.
        </Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRowInline}>
            <Text style={styles.infoKey}>Status:</Text>
            <Text style={styles.infoValGreen}>Active & Verified</Text>
          </View>
          <View style={styles.infoRowInline}>
            <Text style={styles.infoKey}>Verified Date:</Text>
            <Text style={styles.infoVal}>{verifiedDate}</Text>
          </View>
          <View style={styles.infoRowInline}>
            <Text style={styles.infoKey}>Subscription Cycle:</Text>
            <Text style={styles.infoVal}>28 Days Cycle (₹49/mo)</Text>
          </View>
          <View style={styles.infoRowInline}>
            <Text style={styles.infoKey}>Next Renewal Due:</Text>
            <Text style={styles.infoValOrange}>{daysRemaining} Days Remaining</Text>
          </View>
        </View>

        <View style={styles.badgePreviewCard}>
          <View style={styles.badgePill}>
            <Icon name="check-circle" size={16} color="#fff" />
            <Text style={styles.badgePillText}>Verified Expert</Text>
          </View>
          <Text style={styles.badgePreviewText}>
            Orange Badge active on your public profile & consultation cards
          </Text>
        </View>

        {daysRemaining <= 5 && (
          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Renew Subscription (₹49)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPendingState = () => (
    <View style={styles.stateCard}>
      <View style={styles.pendingIconWrap}>
        <Icon name="clock" size={44} color="#f59e0b" />
      </View>

      <Text style={styles.verifiedTitle}>Verification Under Review</Text>
      <Text style={styles.verifiedSubtitle}>
        Your identity documents (Aadhaar Front/Back, PAN, Passport photo & Educational certificates) are being reviewed by our verification team.
      </Text>

      <View style={styles.noticeBox}>
        <Icon name="info" size={18} color="#9a3412" />
        <Text style={styles.noticeText}>
          Verification usually completes within 24-48 hours. Once approved, your Orange Verified Badge (₹49/mo) will activate automatically.
        </Text>
      </View>
    </View>
  );

  const renderDocUploadPicker = (key, label, icon, fileVal) => (
    <View style={styles.uploadCard}>
      <View style={styles.uploadHeader}>
        <Icon name={icon} size={18} color="#f97316" />
        <Text style={styles.uploadLabel}>{label}</Text>
      </View>

      {fileVal ? (
        <View style={styles.selectedFileBox}>
          <Image source={{ uri: fileVal.uri }} style={styles.fileThumbnail} />
          <Text style={styles.fileNameText} numberOfLines={1}>
            {fileVal.fileName}
          </Text>
          <TouchableOpacity onPress={() => setDocuments((prev) => ({ ...prev, [key]: null }))}>
            <Icon name="x-circle" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={() => openPickerModal(key)}>
          <Icon name="upload-cloud" size={20} color="#f97316" />
          <Text style={styles.uploadBtnText}>Upload {label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const isApproved = account?.is_verified || account?.verification_status === "approved";
  const isPending = account?.verification_status === "pending";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Badge</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isApproved ? (
          renderVerifiedState()
        ) : isPending ? (
          renderPendingState()
        ) : (
          <>
            {account?.verification_status === "rejected" && (
              <View style={styles.rejectionBox}>
                <Icon name="alert-triangle" size={20} color="#dc2626" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.rejectionTitle}>Verification Update Required</Text>
                  <Text style={styles.rejectionText}>
                    {account?.verification_rejection_reason ||
                      "Your documents were rejected. Please re-upload clear photos of your documents."}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.heroBanner}>
              <View style={styles.badgePreviewHeader}>
                <View style={styles.badgePill}>
                  <Icon name="check-circle" size={16} color="#fff" />
                  <Text style={styles.badgePillText}>Verified Expert</Text>
                </View>
                <Text style={styles.priceTag}>₹49 / 28 Days</Text>
              </View>

              <Text style={styles.heroTitle}>Get Your Orange Verification Badge</Text>
              <Text style={styles.heroSub}>
                Upload identity & degree documents to get verified, boost search ranking, and build maximum client trust.
              </Text>
            </View>

            <Text style={styles.sectionHeaderTitle}>Upload Required Documents</Text>

            {renderDocUploadPicker("aadhaar_card", "Aadhaar Card (Front)", "credit-card", documents.aadhaar_card)}
            {renderDocUploadPicker("aadhaar_card_back", "Aadhaar Card (Back)", "credit-card", documents.aadhaar_card_back)}
            {renderDocUploadPicker("pan_card", "PAN Card", "file-text", documents.pan_card)}
            {renderDocUploadPicker("passport_photo", "Passport Size Photo", "user", documents.passport_photo)}

            {/* Education Documents (has_many) */}
            <View style={styles.uploadCard}>
              <View style={styles.uploadHeader}>
                <Icon name="book" size={18} color="#f97316" />
                <Text style={styles.uploadLabel}>Education Documents & Degrees</Text>
              </View>

              {documents.education_documents.map((doc, idx) => (
                <View key={idx} style={styles.selectedFileBox}>
                  <Image source={{ uri: doc.uri }} style={styles.fileThumbnail} />
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {doc.fileName}
                  </Text>
                  <TouchableOpacity onPress={() => removeEducationDoc(idx)}>
                    <Icon name="x-circle" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => openPickerModal("education_documents")}
              >
                <Icon name="plus-circle" size={20} color="#f97316" />
                <Text style={styles.uploadBtnText}>+ Add Degree / Educational Certificate</Text>
              </TouchableOpacity>
            </View>

            {/* Benefits Overview */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Verification Badge Benefits</Text>

              {VERIFICATION_BENEFITS.map((item, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={styles.benefitIconBox}>
                    <Icon name={item.icon} size={18} color="#f97316" />
                  </View>
                  <View style={styles.benefitTextWrap}>
                    <Text style={styles.benefitItemTitle}>{item.title}</Text>
                    <Text style={styles.benefitItemDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitVerification}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Verification & Activate (₹49/mo)</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Source Picker Modal */}
      <Modal
        transparent
        visible={imageModalVisible}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Document Photo</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={pickFromCamera}>
              <Icon name="camera" size={18} color="#fff" />
              <Text style={styles.modalBtnText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtn} onPress={pickFromGallery}>
              <Icon name="image" size={18} color="#fff" />
              <Text style={styles.modalBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  stateCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  verifiedIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffedd5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  pendingIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  verifiedTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", textAlign: "center" },
  verifiedSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  infoRowInline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoKey: { color: "#64748b", fontSize: 13 },
  infoVal: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  infoValGreen: { color: "#16a34a", fontWeight: "700", fontSize: 13 },
  infoValOrange: { color: "#f97316", fontWeight: "700", fontSize: 13 },
  badgePreviewCard: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgePillText: { color: "#fff", fontWeight: "700", fontSize: 12, marginLeft: 6 },
  badgePreviewText: { marginTop: 8, color: "#9a3412", fontSize: 12, textAlign: "center" },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  noticeText: { marginLeft: 10, flex: 1, color: "#9a3412", fontSize: 13, lineHeight: 18 },
  rejectionBox: {
    flexDirection: "row",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  rejectionTitle: { fontWeight: "700", color: "#dc2626", fontSize: 14 },
  rejectionText: { marginTop: 4, color: "#991b1b", fontSize: 13 },
  heroBanner: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  badgePreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  priceTag: { fontWeight: "700", color: "#f97316", fontSize: 14 },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  heroSub: { marginTop: 6, fontSize: 13, color: "#64748b", lineHeight: 20 },
  sectionHeaderTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 12 },
  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  uploadHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  uploadLabel: { marginLeft: 8, fontWeight: "700", color: "#0f172a", fontSize: 14 },
  selectedFileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  fileThumbnail: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  fileNameText: { flex: 1, color: "#0f172a", fontSize: 13 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#fdba74",
    borderRadius: 14,
    paddingVertical: 14,
  },
  uploadBtnText: { marginLeft: 8, color: "#f97316", fontWeight: "700", fontSize: 14 },
  benefitsCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginVertical: 16,
  },
  benefitsTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  benefitRow: { flexDirection: "row", marginBottom: 16 },
  benefitIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextWrap: { flex: 1 },
  benefitItemTitle: { fontWeight: "700", color: "#0f172a", fontSize: 14 },
  benefitItemDesc: { marginTop: 2, color: "#64748b", fontSize: 12, lineHeight: 18 },
  submitBtn: {
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16, textAlign: "center" },
  modalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  modalBtnText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  modalCancelBtn: { paddingVertical: 12, alignItems: "center" },
  modalCancelText: { color: "#64748b", fontWeight: "600" },
});