import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import {
  getFavoriteBusinesses,
  unfavoriteBusiness,
} from "../services/business";
import { showToast } from "../utils/toast";

const getInitial = (value) => (value || "E").trim().charAt(0).toUpperCase();

export default function FavoriteScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    fetchFavorites();
  }, [isFocused]);

  const fetchFavorites = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getFavoriteBusinesses();
      const businessProfiles = Array.isArray(response?.business_profiles)
        ? response.business_profiles
        : [];

      setFavorites(businessProfiles);
      setMessage(response?.message || "No favorite experts found");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load favorite experts";
      setFavorites([]);
      setMessage(errorMessage);
      showToast(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUnfavorite = async (item) => {
    if (!item?.id || togglingId) {
      return;
    }

    try {
      setTogglingId(item.id);
      const response = await unfavoriteBusiness(item.id);
      setFavorites((prev) => prev.filter((favorite) => favorite.id !== item.id));
      showToast(response?.message || "Removed from favorites");
    } catch (error) {
      showToast(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update favorite"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const renderFavoriteItem = ({ item }) => {
    const displayName = item.account?.full_name || item.business_name || "Expert";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("ExpertDetailsScreen", { expert: item })}
      >
        <View style={styles.leftSection}>
          {item.account?.profile_pic_url || item.profile_pic_url ? (
            <Image
              source={{ uri: item.account?.profile_pic_url || item.profile_pic_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{getInitial(displayName)}</Text>
            </View>
          )}

          <View style={styles.textWrap}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.bio}>{item.bio || "Business profile"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          disabled={togglingId === item.id}
          onPress={() => handleUnfavorite(item)}
        >
          {togglingId === item.id ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <FontAwesomeIcon name="heart" size={22} color="#dc2626" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesomeIcon name="heart-o" size={28} color="#f97316" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>{message}</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchFavorites(true)}
              tintColor="#f97316"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  iconButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fed7aa",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#9a3412",
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  bio: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    color: "#64748b",
  },
});
