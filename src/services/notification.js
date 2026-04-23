import Api from "./api";

let pollingTimer = null;
let pollingConsumers = 0;
let latestSnapshot = {
  notifications: [],
  unreadCount: 0,
  fetchedAt: null,
};

const listeners = new Set();

const emitSnapshot = () => {
  listeners.forEach((listener) => {
    try {
      listener(latestSnapshot);
    } catch (_error) {
      // Ignore listener errors so other subscribers still update.
    }
  });
};

const setSnapshot = (snapshot) => {
  latestSnapshot = {
    notifications: Array.isArray(snapshot?.notifications)
      ? snapshot.notifications
      : latestSnapshot.notifications,
    unreadCount:
      typeof snapshot?.unreadCount === "number"
        ? snapshot.unreadCount
        : latestSnapshot.unreadCount,
    fetchedAt: new Date().toISOString(),
  };

  emitSnapshot();
};

export const getNotifications = async () => {
  const res = await Api.get("notifications");
  const data = res.data || {};

  setSnapshot({
    notifications: data.notifications || [],
    unreadCount: data.unread_count || 0,
  });

  return data;
};

export const getUnreadNotificationCount = async () => {
  const res = await Api.get("notifications/unread_count");
  const unreadCount = res.data?.unread_count || 0;

  setSnapshot({
    unreadCount,
    notifications: latestSnapshot.notifications,
  });

  return unreadCount;
};

export const markNotificationAsRead = async (id) => {
  const res = await Api.patch(`notifications/${id}/mark_read`);
  const data = res.data || {};

  setSnapshot({
    notifications: latestSnapshot.notifications.map((notification) =>
      notification.id === id
        ? {
            ...notification,
            read_at:
              data?.notification?.read_at || new Date().toISOString(),
          }
        : notification
    ),
    unreadCount:
      typeof data?.unread_count === "number"
        ? data.unread_count
        : Math.max(latestSnapshot.unreadCount - 1, 0),
  });

  return data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await Api.patch("notifications/mark_all_read");
  const data = res.data || {};
  const now = new Date().toISOString();

  setSnapshot({
    notifications: latestSnapshot.notifications.map((notification) => ({
      ...notification,
      read_at: notification.read_at || now,
    })),
    unreadCount: data?.unread_count || 0,
  });

  return data;
};

export const subscribeNotifications = (listener) => {
  listeners.add(listener);
  listener(latestSnapshot);

  return () => {
    listeners.delete(listener);
  };
};

export const refreshNotifications = async () => {
  const data = await getNotifications();
  return {
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    unreadCount: data?.unread_count || 0,
  };
};

export const acquireNotificationPolling = (intervalMs = 15000) => {
  pollingConsumers += 1;

  if (!pollingTimer) {
    pollingTimer = setInterval(() => {
      refreshNotifications().catch(() => {});
    }, intervalMs);
  }
};

export const releaseNotificationPolling = () => {
  pollingConsumers = Math.max(pollingConsumers - 1, 0);

  if (pollingConsumers === 0 && pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

export const removeNotificationFromSnapshot = (id) => {
  const nextNotifications = latestSnapshot.notifications.filter(
    (notification) => notification.id !== id
  );
  const unreadCount = nextNotifications.filter((item) => !item.read_at).length;

  setSnapshot({
    notifications: nextNotifications,
    unreadCount,
  });
};
