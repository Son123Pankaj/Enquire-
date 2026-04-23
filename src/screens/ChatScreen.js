import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { getProfile } from "../services/profile";
import {
  acceptChatSession,
  createChatSubscription,
  declineChatSession,
  endChatSession,
  ensureConversation,
  getChatMessages,
  getConversation,
  requestChat,
  sendChatMessage,
} from "../services/chat";
import { extractApiError } from "../utils/apiError";
import { showToast } from "../utils/toast";

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const subscriptionRef = useRef(null);
  const heartbeatRef = useRef(null);

  const initialExpert = route?.params?.expert || null;
  const initialConversation = route?.params?.conversation || null;

  const [viewer, setViewer] = useState(null);
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);

  const activeSession = conversation?.active_session || null;
  const isBusinessViewer =
    Boolean(viewer?.business_profile?.id) &&
    conversation?.business_profile_id === viewer.business_profile.id;
  const canRequestChat =
    !isBusinessViewer &&
    initialExpert?.id &&
    !activeSession;
  const canAcceptOrDecline =
    isBusinessViewer && activeSession?.status === "requested";
  const canSendMessage = activeSession?.status === "active";
  const canEndSession = activeSession?.status === "active";

  const title = useMemo(() => {
    if (isBusinessViewer) {
      return conversation?.customer?.full_name || "Customer Chat";
    }

    return (
      conversation?.business?.business_name ||
      initialExpert?.business_name ||
      initialExpert?.account?.full_name ||
      "Expert Chat"
    );
  }, [conversation, initialExpert, isBusinessViewer]);

  useEffect(() => {
    loadChat();

    return () => {
      subscriptionRef.current?.disconnect?.();
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [loadChat]);

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    attachRealtime(conversation.id);
  }, [attachRealtime, conversation?.id]);

  useEffect(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (!activeSession?.id || activeSession?.status !== "active") {
      return;
    }

    heartbeatRef.current = setInterval(() => {
      subscriptionRef.current?.sendAction?.({
        action: "heartbeat",
        chat_session_id: activeSession.id,
      });
    }, 45000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [activeSession?.id, activeSession?.status]);

  const handleRealtimeEvent = useCallback((event) => {
    if (!event?.type) {
      return;
    }

    if (event.type === "chat_message" && event.event === "message_created") {
      setMessages((prev) => {
        const nextMessage = event.message;
        if (prev.some((item) => item.id === nextMessage.id)) {
          return prev;
        }

        return [...prev, nextMessage];
      });

      setConversation((prev) =>
        prev
          ? {
              ...prev,
              last_message_at: event.message?.sent_at,
              last_message_preview: event.message?.content,
            }
          : prev
      );

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd?.({ animated: true });
      });
      return;
    }

    if (event.type === "chat_session" && event.session) {
      setConversation((prev) => (prev ? { ...prev, active_session: event.session } : prev));
      return;
    }

    if (event.type === "read_receipt") {
      setMessages((prev) =>
        prev.map((item) =>
          item.sender_account_id === event.reader_account_id
            ? item
            : { ...item, read_at: event.read_at }
        )
      );
    }
  }, []);

  const attachRealtime = useCallback(async (conversationId) => {
    subscriptionRef.current?.disconnect?.();

    subscriptionRef.current = await createChatSubscription({
      conversationId,
      onEvent: handleRealtimeEvent,
      onError: (message) => showToast(message),
    });
  }, [handleRealtimeEvent]);

  const loadChat = useCallback(async () => {
    try {
      setLoading(true);
      const account = await getProfile();
      setViewer(account);

      let nextConversation = initialConversation;
      if (!nextConversation?.id && initialExpert?.id) {
        nextConversation = await ensureConversation(initialExpert.id);
      }

      if (!nextConversation?.id) {
        showToast("Chat conversation is not available");
        navigation.goBack();
        return;
      }

      const [conversationDetails, nextMessages] = await Promise.all([
        getConversation(nextConversation.id),
        getChatMessages(nextConversation.id, { markRead: true }),
      ]);

      setConversation(conversationDetails || nextConversation);
      setMessages(Array.isArray(nextMessages) ? nextMessages.reverse() : []);
    } catch (error) {
      showToast(extractApiError(error, "Unable to open chat"));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [initialConversation, initialExpert, navigation]);

  const refreshConversation = async () => {
    if (!conversation?.id) {
      return;
    }

    const nextConversation = await getConversation(conversation.id);
    setConversation(nextConversation || conversation);
  };

  const handleRequestChat = async () => {
    if (!initialExpert?.id) {
      showToast("Business profile is not available");
      return;
    }

    try {
      setSessionActionLoading(true);
      const response = await requestChat(initialExpert.id);
      if (response.conversation) {
        setConversation(response.conversation);
      }
      showToast(response.message || "Chat request sent");
    } catch (error) {
      showToast(extractApiError(error, "Unable to request chat"));
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!conversation?.id || !activeSession?.id) {
      return;
    }

    try {
      setSessionActionLoading(true);
      const nextSession = await acceptChatSession(conversation.id, activeSession.id);
      setConversation((prev) => (prev ? { ...prev, active_session: nextSession } : prev));
      showToast("Chat session started");
    } catch (error) {
      showToast(extractApiError(error, "Unable to accept chat request"));
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!conversation?.id || !activeSession?.id) {
      return;
    }

    try {
      setSessionActionLoading(true);
      const nextSession = await declineChatSession(conversation.id, activeSession.id);
      setConversation((prev) => (prev ? { ...prev, active_session: nextSession } : prev));
      showToast("Chat request declined");
    } catch (error) {
      showToast(extractApiError(error, "Unable to decline chat request"));
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!conversation?.id || !activeSession?.id) {
      return;
    }

    try {
      setSessionActionLoading(true);
      const nextSession = await endChatSession(conversation.id, activeSession.id);
      setConversation((prev) => (prev ? { ...prev, active_session: nextSession } : prev));
      showToast("Chat session ended");
    } catch (error) {
      showToast(extractApiError(error, "Unable to end chat"));
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !conversation?.id || sending) {
      return;
    }

    try {
      setSending(true);
      const sentViaSocket = subscriptionRef.current?.sendAction?.({
        action: "message",
        content,
      });

      if (!sentViaSocket) {
        const nextMessage = await sendChatMessage(conversation.id, content);
        setMessages((prev) => [...prev, nextMessage]);
      }

      setInput("");
      await refreshConversation();
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd?.({ animated: true });
      });
    } catch (error) {
      showToast(extractApiError(error, "Unable to send message"));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const mine = item?.sender_account_id === viewer?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          mine ? styles.messageBubbleMine : styles.messageBubbleOther,
        ]}
      >
        <Text style={[styles.messageText, mine && styles.messageTextMine]}>
          {item?.content}
        </Text>
        <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>
          {formatTimestamp(item?.sent_at)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerBody}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {activeSession?.status === "active"
              ? "Realtime chat active"
              : activeSession?.status === "requested"
              ? "Waiting for response"
              : "Conversation ready"}
          </Text>
        </View>

        {canEndSession ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEndSession}
            disabled={sessionActionLoading}
          >
            <Icon name="slash" size={18} color="#dc2626" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
      />

      {canAcceptOrDecline ? (
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.flexButton]}
            onPress={handleDecline}
            disabled={sessionActionLoading}
          >
            <Text style={styles.secondaryButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.flexButton]}
            onPress={handleAccept}
            disabled={sessionActionLoading}
          >
            <Text style={styles.primaryButtonText}>Accept Chat</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {canRequestChat ? (
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRequestChat}
            disabled={sessionActionLoading}
          >
            <Text style={styles.primaryButtonText}>Request Paid Chat</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!canSendMessage ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            {activeSession?.status === "requested"
              ? "Messages unlock once the chat request is accepted."
              : "Start or activate a chat session to send realtime messages."}
          </Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type message..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  headerSpacer: {
    width: 38,
  },
  headerBody: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: "78%",
    marginBottom: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: "#f97316",
  },
  messageBubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },
  messageText: {
    color: "#0f172a",
    lineHeight: 20,
  },
  messageTextMine: {
    color: "#fff",
  },
  messageTime: {
    marginTop: 6,
    fontSize: 11,
    color: "#64748b",
  },
  messageTimeMine: {
    color: "#ffedd5",
  },
  sessionActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#f97316",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700",
  },
  noticeBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#fff7ed",
  },
  noticeText: {
    color: "#9a3412",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
  },
});
