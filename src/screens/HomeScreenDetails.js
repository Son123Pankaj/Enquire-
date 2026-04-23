import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import ShimmerCard from "../component/ShimmerCard";
import { getCategories } from "../services/category";
import { getBusiness } from "../services/business";
import { getProfile } from "../services/profile";
import {
  acquireNotificationPolling,
  getUnreadNotificationCount,
  releaseNotificationPolling,
  subscribeNotifications,
} from "../services/notification";
import { extractApiError } from "../utils/apiError";
import { subscribeProfileRefresh } from "../utils/appRefresh";
import { showToast } from "../utils/toast";

export default function HomeScreenDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const selectedCategory = route?.params?.selectedCategory || "ALL";

  const [categories, setCategories] = useState([]);
  const [experts, setExperts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchProfileStatus();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBusiness(searchText);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchText]);

  useEffect(() => {
    fetchBusiness("");
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    fetchProfileStatus();
    fetchCategories();
    fetchBusiness(searchText);
    fetchUnreadCount();
  }, [isFocused, searchText]);

  useEffect(() => {
    const subscription = subscribeProfileRefresh(() => {
      fetchProfileStatus();
      fetchCategories();
      fetchBusiness(searchText);
    });

    return () => subscription.remove();
  }, [searchText]);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((snapshot) => {
      if (typeof snapshot?.unreadCount === "number") {
        setNotifications(snapshot.unreadCount);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }

    acquireNotificationPolling();

    return () => {
      releaseNotificationPolling();
    };
  }, [isFocused]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(Array.isArray(res) ? res : []);
    } catch (error) {
      setCategories([]);
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const profile = await getProfile();
      const hasMissingDetails =
        !profile?.phone ||
        !profile?.state ||
        !profile?.city ||
        !profile?.district ||
        !profile?.pincode;

      setShowProfileWarning(hasMissingDetails);
    } catch (error) {
      setShowProfileWarning(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setNotifications(count);
    } catch (error) {
      setNotifications(0);
    }
  };

  const fetchBusiness = async (query = "") => {
    try {
      setLoading(true);
      const res = await getBusiness(query);
      const businessProfiles = Array.isArray(res?.business_profiles)
        ? res.business_profiles
        : [];
      const backendMessage = res?.message || "";

      if (businessProfiles.length === 0) {
        setExperts([]);
        setMessage(backendMessage || "No Experts found");
      } else {
        setExperts(businessProfiles);
        setMessage(backendMessage);
      }
    } catch (error) {
      setExperts([]);
      setMessage(extractApiError(error, "Error fetching experts"));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName) => {
    setActiveCategory((prev) =>
      prev === categoryName || categoryName === "ALL" ? "ALL" : categoryName
    );
  };

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredExperts =
    activeCategory === "ALL"
      ? experts
      : activeCategory === "POPULAR"
      ? experts.slice(0, 10)
      : experts.filter((item) =>
          item.categories?.some((category) => category.name === activeCategory)
        );

  const finalExperts = filteredExperts.filter((item) => {
    const businessName = item.business_name?.toLowerCase() || "";
    const matchesName = businessName.includes(normalizedSearch);
    const matchesCategory = item.categories?.some((category) =>
      category.name?.toLowerCase().includes(normalizedSearch)
    );

    return matchesName || matchesCategory || !normalizedSearch;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/preview-tax-logo-cropped.png")}
            style={styles.logoImage}
          />

          <View style={styles.headerIcons}>
            <Icon name="search" size={20} style={styles.iconSpace} />
            <Icon name="heart" size={20} style={styles.iconSpace} />
            <Icon name="bell" size={20} />
          </View>
        </View>

        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <ShimmerCard />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/preview-tax-logo-cropped.png")}
          style={styles.logoImage}
        />

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconSpace}
            onPress={() => setShowSearch((prev) => !prev)}
          >
            <Icon name="search" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconSpace}
            onPress={() => navigation.navigate("Favorite")}
          >
            <Icon name="heart" size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <Icon name="bell" size={20} />
            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#777" />
          <TextInput
            placeholder="Search experts or categories..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            autoFocus
          />
        </View>
      )}

      {showProfileWarning && (
        <View style={styles.warningBanner}>
          <Icon name="alert-triangle" size={16} color="#9a3412" />
          <Text style={styles.warningText}>
            Please Complete your personal information mobile, state, city and other details to get more visibility and trust from clients.
          </Text>
        </View>
      )}

      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <TouchableOpacity
            onPress={() => handleCategoryPress("ALL")}
            style={[
              styles.catBtn,
              activeCategory === "ALL" && styles.activeCat,
            ]}
          >
            <Text
              style={[
                styles.catText,
                activeCategory === "ALL" && styles.activeText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCategoryPress("POPULAR")}
            style={[
              styles.catBtn,
              activeCategory === "POPULAR" && styles.activeCat,
            ]}
          >
            <Icon
              name="trending-up"
              size={14}
              color={activeCategory === "POPULAR" ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.catText,
                activeCategory === "POPULAR" && styles.activeText,
              ]}
            >
              {" "}Popular
            </Text>
          </TouchableOpacity>

          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id || `${category.name}-${index}`}
              onPress={() => handleCategoryPress(category.name)}
              style={[
                styles.catBtn,
                activeCategory === category.name && styles.activeCat,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === category.name && styles.activeText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!loading && finalExperts.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{message || "No Experts found"}</Text>
        </View>
      )}

      <FlatList
        data={finalExperts}
        keyExtractor={(item, index) => String(item.id || index)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("ExpertDetailsScreen", { expert: item })
            }
          >
            <View style={styles.left}>
              {item.account?.profile_pic_url || item.profile_pic_url ? (
                <Image
                  source={{
                    uri: item.account?.profile_pic_url || item.profile_pic_url,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {(item.account?.full_name || item.business_name || "E")
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.textWrap}>
                <Text style={styles.name}>
                  {item.account?.full_name || item.business_name || "Expert"}
                </Text>
                <Text style={styles.role}>{item.bio || "Business profile"}</Text>
                <Text style={styles.rating}>
                  {"★★★★★ "} {item.avg_rating || "0.0"} ({item.reviews_count || 0})
                </Text>

                <View style={styles.actionRowInline}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      if (item?.currently_available === false || item?.is_available === false) {
                        showToast("This expert is currently unavailable");
                        return;
                      }

                      navigation.navigate("Chat", { expert: item });
                    }}
                  >
                    <Icon name="message-circle" size={16} color="#4CAF50" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <Icon name="phone-call" size={16} color="#2196F3" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionBtn}>
                    <Icon name="video" size={16} color="#E91E63" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.right}>
              <View style={styles.priceRow}>
                <Icon name="message-circle" size={14} color="#111" />
                <Text style={styles.priceText}>₹ {item.chat_price ?? "0"}/min</Text>
              </View>

              <View style={styles.priceRow}>
                <Icon name="phone-call" size={14} color="#111" />
                <Text style={styles.priceText}>₹ {item.call_price ?? "0"}/min</Text>
              </View>

              <View style={styles.priceRow}>
                <Icon name="video" size={14} color="#111" />
                <Text style={styles.priceText}>₹ {item.v_call_price ?? "0"}/min</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
  },

  headerIcons: {
    flexDirection: "row",
  },

  iconSpace: {
    marginRight: 15,
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
  },

  logoImage: {
    width: 152,
    height: 34,
    resizeMode: "contain",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 40,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
  },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffedd5",
    borderWidth: 1,
    borderColor: "#fdba74",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  warningText: {
    flex: 1,
    marginLeft: 8,
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "600",
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  categoryWrapper: {
    paddingVertical: 10,
  },

  categoryRow: {
    paddingHorizontal: 5,
  },

  catBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  activeCat: {
    backgroundColor: "#f97316",
  },

  catText: {
    fontSize: 13,
    color: "#000",
  },

  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    flex: 1,
  },

  textWrap: {
    marginLeft: 10,
    flex: 1,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  name: {
    fontWeight: "bold",
    color: "#0f172a",
  },

  role: {
    fontSize: 12,
    color: "#666",
  },

  categoryLine: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },

  rating: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  right: {
    justifyContent: "center",
    marginLeft: 10,
  },

  actionBtn: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 25,
    marginRight: 8,
  },

  actionRowInline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  priceText: {
    marginLeft: 6,
    color: "#111",
    fontSize: 12,
    fontWeight: "600",
  },
});
