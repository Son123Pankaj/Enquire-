import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useIsFocused } from "@react-navigation/native";
import {
  acquireNotificationPolling,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  refreshNotifications,
  releaseNotificationPolling,
  removeNotificationFromSnapshot,
  subscribeNotifications,
} from "../services/notification";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return date.toLocaleString();
};

export default function NotificationsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((snapshot) => {
      setNotifications(snapshot?.notifications || []);
      setUnreadCount(snapshot?.unreadCount || 0);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }

    setLoading(true);
    acquireNotificationPolling();
    fetchNotifications();

    return () => {
      releaseNotificationPolling();
    };
  }, [isFocused]);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true);
      }
      await refreshNotifications();
    } catch (error) {
      showToast(extractApiError(error, "Unable to load notifications"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (item) => {
    if (item.read_at) {
      return;
    }

    try {
      const response = await markNotificationAsRead(item.id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                read_at:
                  response?.notification?.read_at ||
                  new Date().toISOString(),
              }
            : notification
        )
      );
      setUnreadCount(response?.unread_count ?? Math.max(unreadCount - 1, 0));
      showToast(response?.message || "Notification marked as read");
    } catch (error) {
      showToast(extractApiError(error, "Unable to mark notification as read"));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const response = await markAllNotificationsAsRead();
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || now,
        }))
      );
      setUnreadCount(response?.unread_count || 0);
      showToast(response?.message || "All notifications marked as read");
    } catch (error) {
      showToast(extractApiError(error, "Unable to mark all notifications as read"));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = (id) => {
    removeNotificationFromSnapshot(id);
    showToast("Notification removed from list");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>

        <TouchableOpacity onPress={handleMarkAllRead} disabled={markingAll}>
          {markingAll ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            <Text style={styles.markAllText}>Mark all read</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>
        Unread notifications: {unreadCount}
      </Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="bell-off" size={28} color="#94a3b8" />
          <Text style={styles.emptyText}>No notifications found</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications()}
              tintColor="#f97316"
            />
          }
          renderItem={({ item }) => {
            const unread = !item.read_at;

            return (
              <View style={[styles.card, unread && styles.cardUnread]}>
                  <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderContent}>
                    <Text style={styles.cardTitle}>{item.title || "Notification"}</Text>
                    <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Icon name="trash-2" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardBody}>{item.body || "No details available"}</Text>

                <View style={styles.actionRow}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>
                      {unread ? "Unread" : "Read"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.readButton, !unread && styles.readButtonDisabled]}
                    disabled={!unread}
                    onPress={() => handleMarkRead(item)}
                  >
                    <Text
                      style={[
                        styles.readButtonText,
                        !unread && styles.readButtonTextDisabled,
                      ]}
                    >
                      Mark as read
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  markAllText: {
    color: "#f97316",
    fontWeight: "700",
    fontSize: 13,
  },

  subTitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 14,
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  cardUnread: {
    borderWidth: 1,
    borderColor: "#fdba74",
    backgroundColor: "#fffaf5",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  cardHeaderContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  cardDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },

  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },

  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  statusChipText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 12,
  },

  readButton: {
    backgroundColor: "#f97316",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  readButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },

  readButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  readButtonTextDisabled: {
    color: "#64748b",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748b",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
