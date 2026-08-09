import AsyncStorage from "@react-native-async-storage/async-storage";
import Api from "./api";

const buildCableUrl = () => {
  const apiBaseUrl = Api.defaults.baseURL || "";
  const origin = apiBaseUrl.replace(/\/api\/v1\/?$/, "");

  if (origin.startsWith("https://")) {
    return `${origin.replace("https://", "wss://")}/cable`;
  }

  if (origin.startsWith("http://")) {
    return `${origin.replace("http://", "ws://")}/cable`;
  }

  return `${origin}/cable`;
};

const buildIdentifier = (conversationId) =>
  JSON.stringify({
    channel: "ChatConversationChannel",
    conversation_id: conversationId,
  });

export const getChatConversations = async () => {
  const response = await Api.get("chat_conversations");
  return response.data?.chat_conversations || [];
};

export const ensureConversation = async (businessProfileId) => {
  const response = await Api.post("chat_conversations", {
    business_profile_id: businessProfileId,
  });

  return response.data?.chat_conversation || null;
};

export const getConversation = async (conversationId) => {
  const response = await Api.get(`chat_conversations/${conversationId}`);
  return response.data?.chat_conversation || null;
};

export const getChatMessages = async (conversationId, options = {}) => {
  const response = await Api.get(`chat_conversations/${conversationId}/chat_messages`, {
    params: {
      mark_read: options.markRead ? "true" : undefined,
    },
  });

  return response.data?.chat_messages || [];
};

export const requestChat = async (businessProfileId) => {
  const response = await Api.post(`business_profiles/${businessProfileId}/chat_request`);
  return {
    conversation: response.data?.chat_conversation || null,
    session: response.data?.chat_session || null,
    message: response.data?.message,
  };
};

export const acceptChatSession = async (conversationId, sessionId) => {
  const response = await Api.post(
    `chat_conversations/${conversationId}/chat_sessions/${sessionId}/accept`
  );
  return response.data?.chat_session || null;
};

export const declineChatSession = async (conversationId, sessionId) => {
  const response = await Api.post(
    `chat_conversations/${conversationId}/chat_sessions/${sessionId}/decline`
  );
  return response.data?.chat_session || null;
};

export const endChatSession = async (conversationId, sessionId, reason = "ended by user") => {
  const response = await Api.post(
    `chat_conversations/${conversationId}/chat_sessions/${sessionId}/end_session`,
    { reason }
  );
  return response.data?.chat_session || null;
};

export const sendChatMessage = async (conversationId, content) => {
  const response = await Api.post(
    `chat_conversations/${conversationId}/chat_messages`,
    {
      chat_message: { content },
    }
  );

  return response.data?.chat_message || null;
};

export const createChatSubscription = async ({
  conversationId,
  onEvent,
  onError,
}) => {
  const token = await AsyncStorage.getItem("token");
  const cableUrl = `${buildCableUrl()}?token=${encodeURIComponent(token || "")}`;
  const identifier = buildIdentifier(conversationId);
  let socket = null;
  let isClosedManually = false;
  let reconnectTimer = null;

  const connect = () => {
    socket = new WebSocket(cableUrl);

    socket.onopen = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            command: "subscribe",
            identifier,
          })
        );
      }
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "welcome" || payload.type === "ping") {
          return;
        }

        if (payload.type === "reject_subscription") {
          onError?.("Chat subscription was rejected");
          return;
        }

        if (payload.message) {
          onEvent?.(payload.message);
        }
      } catch (error) {
        // Silent error handling for non-JSON or ping frames
      }
    };

    socket.onerror = () => {
      // Handled in onclose auto-reconnect
    };

    socket.onclose = () => {
      if (!isClosedManually) {
        reconnectTimer = setTimeout(() => {
          connect();
        }, 3000);
      }
    };
  };

  connect();

  const sendAction = (payload) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(
        JSON.stringify({
          command: "message",
          identifier,
          data: JSON.stringify({
            conversation_id: conversationId,
            ...payload,
          }),
        })
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    disconnect: () => {
      isClosedManually = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
    },
    sendAction,
  };
};

