import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { getChatConversations } from "../services/chat";
import { getCallHistories } from "../services/callHistory";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const HISTORY_TABS = [
  { key: "chat", label: "Chat", icon: "message-circle" },
  { key: "call", label: "Call", icon: "phone" },
  { key: "video", label: "Video", icon: "video" },
];

const formatRelativeTime = (value) => {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No activity yet";
  }

  return date.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function HistoryScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState("chat");
  const [chatConversations, setChatConversations] = useState([]);
  const [callHistories, setCallHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    loadHistory();
  }, [isFocused]);

  const loadHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [nextConversations, callHistoryResponse] = await Promise.all([
        getChatConversations(),
        getCallHistories(),
      ]);

      setChatConversations(Array.isArray(nextConversations) ? nextConversations : []);
      setCallHistories(callHistoryResponse.callHistories || []);
    } catch (error) {
      showToast(extractApiError(error, "Unable to load history"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const tabData = useMemo(() => {
    return {
      chat: chatConversations,
      call: callHistories,
      video: [],
    };
  }, [chatConversations, callHistories]);

  const renderCallHistory = ({ item }) => {
    const contactName =
      item.receiver_account?.full_name || item.caller_account?.full_name || "Unknown";
    const callTypeLabel = item.call_type === "voice" ? "Voice Call" : "Video Call";
    const durationMinutes = Math.floor((item.duration_seconds || 0) / 60);
    const durationSeconds = (item.duration_seconds || 0) % 60;

    return (
      <View style={[styles.card, styles.callCard]}>        
        <View style={styles.callAvatar}>
          <Text style={styles.avatarText}>{contactName.trim().charAt(0).toUpperCase() || "U"}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>
              {contactName}
            </Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>

          <Text style={styles.subtitle} numberOfLines={1}>
            {callTypeLabel} • {durationMinutes}:{String(durationSeconds).padStart(2, "0")}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{item.status?.toUpperCase() || "COMPLETED"}</Text>
            </View>
            {item.amount_charged_cents ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>-₹{(item.amount_charged_cents / 100).toFixed(2)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  const renderTabItem = ({ item }) => {
    if (activeTab === "call") {
      return renderCallHistory({ item });
    }

    return renderConversation({ item });
  };

  const emptyStateContent = useMemo(() => {
    if (activeTab === "call") {
      return {
        icon: "phone-off",
        title: "No call history yet",
        subtitle: "Completed or upcoming call records will appear here when call history is available.",
      };
    }

    if (activeTab === "video") {
      return {
        icon: "video-off",
        title: "No video meetings yet",
        subtitle:
          "Completed or upcoming video meeting records will appear here when video meeting history is available.",
      };
    }

    return {
      icon: "message-circle",
      title: "No chats yet",
      subtitle: "Your realtime customer and expert conversations will appear here.",
    };
  }, [activeTab]);

  const renderConversation = ({ item }) => {
    const business = item?.business || {};
    const customer = item?.customer || {};
    const title = business?.business_name || customer?.full_name || "Conversation";
    const subtitle = item?.last_message_preview || "Open chat to start talking";
    const statusLabel =
      item?.active_session?.status === "requested"
        ? "Pending"
        : item?.active_session?.status === "active"
        ? "Active"
        : "Idle";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Chat", { conversation: item })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {title.trim().charAt(0).toUpperCase() || "C"}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.time}>{formatRelativeTime(item?.last_message_at)}</Text>
          </View>

          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>

            {item?.unread_count ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.centered}>
      <View style={styles.emptyCard}>
        <Icon name={emptyStateContent.icon} size={28} color="#f97316" />
        <Text style={styles.emptyTitle}>{emptyStateContent.title}</Text>
        <Text style={styles.emptyText}>{emptyStateContent.subtitle}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {HISTORY_TABS.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, active && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon
                name={tab.icon}
                size={16}
                color={active ? "#fff" : "#64748b"}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tabData[activeTab].length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={tabData[activeTab]}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTabItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  tabText: {
    marginLeft: 6,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  callCard: {
    alignItems: "center",
  },
  callAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#bfdbfe",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffedd5",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#c2410c",
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginRight: 12,
  },
  time: {
    fontSize: 11,
    color: "#64748b",
  },
  subtitle: {
    marginTop: 6,
    color: "#475569",
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c2410c",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
});
