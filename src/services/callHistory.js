import Api from "./api";

export const getCallHistories = async () => {
  const response = await Api.get("call_histories");
  return {
    callHistories: response.data?.call_histories || [],
    pagination: response.data?.pagination,
  };
};

export const startCallHistory = async (receiverAccountId, callType, channelName) => {
  const response = await Api.post("call_histories", {
    receiver_account_id: receiverAccountId,
    call_type: callType,
    channel_name: channelName,
  });
  return response.data?.call_history || null;
};

export const endCallHistory = async (callHistoryId, durationSeconds, endReason = "ended by user") => {
  const response = await Api.post(`call_histories/${callHistoryId}/end_call`, {
    duration_seconds: durationSeconds,
    end_reason: endReason,
  });
  return response.data?.message;
};
