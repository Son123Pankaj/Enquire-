import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { getProfile, updateProfile } from "../services/profile";
import { getAddressByPincode } from "../services/pincode";
import { showToast } from "../utils/toast";

const LANGUAGE_OPTIONS = ["Hindi", "English"];

const PersonalInfo = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSourceVisible, setImageSourceVisible] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    email: "",
    pincode: "",
    city: "",
    district: "",
    state: "",
    languages: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setForm({
        full_name: profile?.full_name || "",
        username: profile?.username || "",
        phone: profile?.phone ? String(profile.phone) : "",
        email: profile?.email || "",
        pincode: profile?.pincode ? String(profile.pincode) : "",
        city: profile?.city || "",
        district: profile?.district || "",
        state: profile?.state || "",
        languages: Array.isArray(profile?.languages) ? profile.languages : [],
      });

      if (profile?.profile_pic?.url || profile?.profile_pic_url) {
        const picture = profile?.profile_pic || {};
        setSelectedImage({
          uri: picture.url || profile.profile_pic_url,
          type: picture.content_type || "image/jpeg",
          fileName: picture.filename || "profile.jpg",
          fileSize: picture.byte_size || 0,
          isRemote: true,
        });
      }
    } catch (error) {
      showToast("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    handleChange("phone", numericValue);
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
        city: address.city,
        district: address.district,
        state: address.state,
      }));
    } catch (error) {
      showToast("Address not found for this pincode");
    } finally {
      setPincodeLoading(false);
    }
  };

  const toggleLanguage = (language) => {
    setForm((prev) => {
      const alreadySelected = prev.languages.includes(language);
      return {
        ...prev,
        languages: alreadySelected
          ? prev.languages.filter((item) => item !== language)
          : [...prev.languages, language],
      };
    });
  };

  const applyImageAsset = (asset) => {
    if (!asset?.uri) {
      return;
    }

    setSelectedImage({
      uri: asset.uri,
      type: asset.type || "image/jpeg",
      fileName: asset.fileName || `profile-${Date.now()}.jpg`,
      fileSize: asset.fileSize || 0,
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
    const granted = await PermissionsAndroid.request(permission, {
      title: "Camera Permission",
      message: "Profile photo capture ke liye camera permission chahiye.",
      buttonPositive: "OK",
      buttonNegative: "Cancel",
    });

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const granted = await PermissionsAndroid.request(permission, {
      title: "Gallery Permission",
      message: "Profile photo choose karne ke liye gallery permission chahiye.",
      buttonPositive: "OK",
      buttonNegative: "Cancel",
    });

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickFromCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        showToast("Camera permission is required");
        return;
      }

      const result = await launchCamera({
        mediaType: "photo",
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result?.errorCode) {
        showToast(result.errorMessage || "Unable to open camera");
        return;
      }

      if (!result.didCancel) {
        applyImageAsset(result.assets?.[0]);
      }
    } catch (error) {
      showToast("Unable to open camera");
    }
  };

  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        showToast("Gallery permission is required");
        return;
      }

      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result?.errorCode) {
        showToast(result.errorMessage || "Unable to open gallery");
        return;
      }

      if (!result.didCancel) {
        applyImageAsset(result.assets?.[0]);
      }
    } catch (error) {
      showToast("Unable to open gallery");
    }
  };

  const handleImageSelection = () => {
    setImageSourceVisible(true);
  };

  const handleSave = async () => {
    // const normalizedPhone = String(form.phone || "").replace(/[^0-9]/g, "");

    if (!form.full_name || !form.username || !form.phone) {
      showToast("Name, username and phone are required");
      return;
    }

    if (selectedImage?.fileSize && selectedImage.fileSize > 1024 * 1024) {
      showToast("Profile picture must be 1 MB or smaller");
      return;
    }

    try {
      setSaving(true);

      if (selectedImage?.uri && !selectedImage?.isRemote) {
        const payload = new FormData();
        payload.append("account[full_name]", form.full_name);
        payload.append("account[username]", form.username);
        payload.append("account[phone]", form.phone);
        payload.append("account[pincode]", form.pincode);
        payload.append("account[city]", form.city);
        payload.append("account[district]", form.district);
        payload.append("account[state]", form.state);
        form.languages.forEach((language) => {
          payload.append("account[languages][]", language);
        });
        payload.append("account[profile_pic]", {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName,
        });

        await updateProfile(payload);
      } else {
        await updateProfile({
          full_name: form.full_name,
          username: form.username,
          phone: form.phone,
          pincode: form.pincode,
          city: form.city,
          district: form.district,
          state: form.state,
          languages: form.languages,
        });
      }

      showToast("Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      showToast(
        error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Update failed"
      );
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
    <>
      <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="x" size={28} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity disabled={saving} onPress={handleSave}>
          {saving ? (
            <ActivityIndicator size="small" color="#111827" />
          ) : (
            <Icon name="check" size={28} color="#111827" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Personal Information</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={handleImageSelection}>
          {selectedImage?.uri ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera" size={22} color="#f59e0b" />
              <Text style={styles.imagePlaceholderText}>Upload profile picture</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(text) => handleChange("full_name", text)}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={(text) => handleChange("username", text)}
            placeholder="Enter username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={String(form.phone)}
            onChangeText={handlePhoneChange}
            placeholder="Enter phone"
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.email}
            editable={false}
            placeholder="Email"
          />

          <Text style={styles.label}>Pincode</Text>
          <View style={styles.inlineInputWrap}>
            <TextInput
              style={[styles.input, styles.inlineInput]}
              value={form.pincode}
              onChangeText={handlePincodeChange}
              placeholder="Enter pincode"
              keyboardType="number-pad"
              maxLength={6}
            />
            {pincodeLoading && (
              <ActivityIndicator size="small" color="#f59e0b" style={styles.inlineLoader} />
            )}
          </View>

          <Text style={styles.label}>City</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={form.city} editable={false} />

          <Text style={styles.label}>District</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.district}
            editable={false}
          />

          <Text style={styles.label}>State</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={form.state} editable={false} />

          <Text style={styles.label}>Languages</Text>
          <View style={styles.languageWrap}>
            {LANGUAGE_OPTIONS.map((language) => {
              const active = form.languages.includes(language);
              return (
                <TouchableOpacity
                  key={language}
                  style={[styles.languageChip, active && styles.languageChipActive]}
                  onPress={() => toggleLanguage(language)}
                >
                  <Text
                    style={[styles.languageChipText, active && styles.languageChipTextActive]}
                  >
                    {language}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      </View>

      <Modal
        transparent
        visible={imageSourceVisible}
        animationType="fade"
        onRequestClose={() => setImageSourceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose image source</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setImageSourceVisible(false);
                pickFromCamera();
              }}
            >
              <Text style={styles.modalButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setImageSourceVisible(false);
                pickFromGallery();
              }}
            >
              <Text style={styles.modalButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => setImageSourceVisible(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default PersonalInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  topBar: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 18,
  },

  imagePicker: {
    alignSelf: "center",
    marginBottom: 20,
  },

  previewImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#e2e8f0",
  },

  imagePlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 11,
    textAlign: "center",
    color: "#9a3412",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
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
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    color: "#0f172a",
  },

  disabledInput: {
    backgroundColor: "#eef2f7",
    color: "#64748b",
  },

  inlineInputWrap: {
    position: "relative",
    justifyContent: "center",
  },

  inlineInput: {
    paddingRight: 42,
  },

  inlineLoader: {
    position: "absolute",
    right: 14,
  },

  languageWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },

  languageChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
    marginBottom: 10,
  },

  languageChipActive: {
    backgroundColor: "#f59e0b",
  },

  languageChipText: {
    color: "#334155",
    fontWeight: "600",
  },

  languageChipTextActive: {
    color: "#fff",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButton: {
    borderRadius: 14,
    backgroundColor: "#f97316",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalButtonSecondary: {
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonSecondaryText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
