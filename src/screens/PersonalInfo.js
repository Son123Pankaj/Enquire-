import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getProfile, updateProfile } from "../../services/profileService";

const PersonalInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setForm({
        full_name: res.data.full_name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (e) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) {
      Alert.alert("Validation", "Name & Email required");
      return;
    }

    try {
      setSaving(true);
      await updateProfile(form);
      Alert.alert("Success", "Profile Updated");
    } catch (e) {
      Alert.alert("Error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <View style={styles.card}>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          value={form.full_name}
          onChangeText={(t) => handleChange("full_name", t)}
        />

        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(t) => handleChange("email", t)}
        />

        <Text>Phone</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(t) => handleChange("phone", t)}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PersonalInfo;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 5,
  },

  btn: {
    backgroundColor: "#1E5BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});