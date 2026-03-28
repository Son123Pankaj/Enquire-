import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import {
  getBusinessDetails,
  updateBusinessDetails,
} from "../../services/businessService";

const BusinessDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    experience: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const res = await getBusinessDetails();
      setForm({
        business_name: res.data.business_name || "",
        experience: res.data.experience || "",
        address: res.data.address || "",
        description: res.data.description || "",
      });
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to load business data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    if (!form.business_name) {
      Alert.alert("Validation", "Business name required");
      return;
    }

    try {
      setSaving(true);
      await updateBusinessDetails(form);
      Alert.alert("Success", "Business Updated");
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
      <Text style={styles.title}>Business Details</Text>

      <View style={styles.card}>
        <Text>Business Name</Text>
        <TextInput
          style={styles.input}
          value={form.business_name}
          onChangeText={(t) => handleChange("business_name", t)}
        />

        <Text>Experience (Years)</Text>
        <TextInput
          style={styles.input}
          value={form.experience}
          onChangeText={(t) => handleChange("experience", t)}
          keyboardType="numeric"
        />

        <Text>Address</Text>
        <TextInput
          style={styles.input}
          value={form.address}
          onChangeText={(t) => handleChange("address", t)}
        />

        <Text>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={form.description}
          onChangeText={(t) => handleChange("description", t)}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Save Business</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BusinessDetails;

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