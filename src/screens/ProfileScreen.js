import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import { getProfile } from "../services/auth";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isDark = useColorScheme() === "dark";

  // 🔥 FETCH PROFILE
  const fetchProfile = async () => {
    try {
      const res = await getProfile();

      console.log("PROFILE DATA:", res.data);

      setUser(res.data.account); // ⚠️ response structure
    } catch (error) {
      console.log("PROFILE ERROR:", error?.response?.data);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔄 Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.replace("EmailLogin");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4facfe" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43"] : ["#4facfe", "#00f2fe"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 👤 PROFILE CARD */}
        <View style={styles.card}>
          <Icon name="user" size={60} color="#4facfe" />

          <Text style={styles.name}>
            {user?.full_name || "No Name"}
          </Text>

          <Text style={styles.email}>
            {user?.email || "No Email"}
          </Text>
        </View>

        {/* 📋 INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.label}>City</Text>
          <Text style={styles.value}>{user?.city || "-"}</Text>

          <Text style={styles.label}>State</Text>
          <Text style={styles.value}>{user?.state || "-"}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone || "-"}</Text>
        </View>

        {/* 🚪 LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
    marginBottom: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  email: {
    color: "#666",
    marginTop: 5,
  },

  infoBox: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },

  label: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});