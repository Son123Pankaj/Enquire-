import Api from "./api";

export const requestAgoraToken = async ({ channelName, uid, role = "publisher" }) => {
  const response = await Api.post("agora/token", {
    channel_name: channelName,
    uid: String(uid),
    role,
  });

  return {
    appId: response.data?.app_id,
    token: response.data?.token,
    channelName: response.data?.channel_name,
    uid: response.data?.uid,
  };
};
