import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { fetchUserActivityLogs } from "../services/deviceMonitoring";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const getEventConfig = (event = "") => {
  const e = event.toUpperCase();
  if (e.includes("LOGIN")) return { icon: "log-in", color: "#2563eb", bg: "#dbeafe" };
  if (e.includes("LOGOUT")) return { icon: "log-out", color: "#64748b", bg: "#f1f5f9" };
  if (e.includes("CALL")) return { icon: "phone-call", color: "#059669", bg: "#d1fae5" };
  if (e.includes("VIDEO")) return { icon: "video", color: "#7c3aed", bg: "#ede9fe" };
  if (e.includes("PAYMENT")) return { icon: "credit-card", color: "#16a34a", bg: "#dcfce7" };
  if (e.includes("PROFILE") || e.includes("VERIFICATION")) return { icon: "user-check", color: "#ea580c", bg: "#ffedd5" };
  if (e.includes("CHAT")) return { icon: "message-square", color: "#0284c7", bg: "#e0f2fe" };
  return { icon: "activity", color: "#4f46e5", bg: "#e0e7ff" };
};

export default function ActivityLogScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadActivityLogs = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const data = await fetchUserActivityLogs(pageNum, 20);
      const newLogs = data?.activity_logs || [];

      if (isRefresh || pageNum === 1) {
        setLogs(newLogs);
      } else {
        setLogs((prev) => [...prev, ...newLogs]);
      }

      setHasMore(pageNum < (data?.meta?.total_pages || 1));
      setPage(pageNum);
    } catch (error) {
      showToast(extractApiError(error, "Unable to load activity log"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivityLogs(1);
  }, []);

  const renderTimelineItem = ({ item, index }) => {
    const config = getEventConfig(item.event);
    const isLast = index === logs.length - 1;

    return (
      <View style={styles.timelineRow}>
        <View style={styles.timelineColumn}>
          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Icon name={config.icon} size={16} color={config.color} />
          </View>
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.timeText}>{item.time_ago}</Text>
          </View>
          <Text style={styles.eventDate}>
            {new Date(item.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTimelineItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadActivityLogs(1, true)}
              tintColor="#f97316"
            />
          }
          onEndReached={() => {
            if (hasMore && !loading && !refreshing) {
              loadActivityLogs(page + 1);
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="activity" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptySub}>Your recent account actions will appear here in a clean timeline.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  loaderCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 20, paddingBottom: 40 },
  timelineRow: { flexDirection: "row", marginBottom: 16 },
  timelineColumn: { alignItems: "center", marginRight: 14 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
    marginBottom: -16,
  },
  cardContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTitle: { fontSize: 15, fontWeight: "600", color: "#1e293b", flex: 1, marginRight: 8 },
  timeText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  eventDate: { fontSize: 12, color: "#94a3b8" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#334155", marginTop: 12 },
  emptySub: { fontSize: 14, color: "#64748b", textAlign: "center", marginTop: 6, paddingHorizontal: 30 },
});
