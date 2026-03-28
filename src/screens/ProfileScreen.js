import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { getProfile } from "../services/profile";

const menuItems = [
  { name: "Share Profile", icon: "share-2", screen: "ShareProfile" },
  { name: "Profile QR Code", icon: "grid", screen: "ProfileQR" },
  { name: "Personal Info", icon: "user", screen: "PersonalInfo" },
  { name: "Business Details", icon: "briefcase", screen: "BusinessDetails" },
  { name: "Category", icon: "layers", screen: "Category" },
  { name: "Schedule", icon: "calendar", screen: "Schedule" },
  { name: "Call Rates", icon: "phone", screen: "CallRates" },
  { name: "Approval", icon: "check-circle", screen: "Approval" },
  { name: "Verification Badge", icon: "award", screen: "Verification" },
  { name: "Favorite", icon: "heart", screen: "Favorite" },
  { name: "About App", icon: "info", screen: "About" },
  { name: "Account Privacy", icon: "lock", screen: "Privacy" },
  { name: "Support", icon: "help-circle", screen: "Support" },
  { name: "Logout", icon: "log-out", screen: "Logout" },
];

const ProfileScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      console.log("Profile Data:", res.data);
      setUser(res.data);
    } catch (error) {
      console.log("Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />

        {/* Center Profile */}
        <View style={styles.centerProfile}>
          <View style={styles.iconCircle}>
            <Icon name="user" size={40} color="#fff" />
          </View>

          {/* Dynamic Name */}
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.name}>
              {user
                ? user.full_name ||
                  `${user.first_name || ""} ${user.last_name || ""}`
                : "No Name"}
            </Text>
          )}
        </View>

        {/* 3 dots */}
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.bottomSheet}>
            <FlatList
              data={menuItems}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  activeOpacity={0.7}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <View style={styles.menuRow}>
                    <Icon name={item.icon} size={20} color="#333" />
                    <Text style={styles.menuText}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  centerProfile: {
    alignItems: "center",
    flex: 1,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E5BFF",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: "80%",
  },

  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
});