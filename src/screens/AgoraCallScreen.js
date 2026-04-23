import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from "react-native-agora";
import { useRoute, useNavigation } from "@react-navigation/native";
import { requestAgoraToken } from "../services/agora";
import { startCallHistory, endCallHistory } from "../services/callHistory";
import { showToast } from "../utils/toast";

export default function AgoraCallScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const engineRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callHistoryId, setCallHistoryId] = useState(null);

  const { expert, callType = "video" } = route.params || {};
  const channelName = route.params?.channelName || `expert-${expert?.id}-${callType}`;
  const uid = route.params?.uid || String(Math.floor(Math.random() * 1000000));

  useEffect(() => {
    let isMounted = true;

    const setupAgora = async () => {
      try {
        const { appId, token } = await requestAgoraToken({
          channelName,
          uid,
          role: "publisher",
        });

        if (!appId || !token) {
          throw new Error("Unable to obtain Agora credentials");
        }

        const rtcEngine = await RtcEngine.create(appId);
        engineRef.current = rtcEngine;

        rtcEngine.setChannelProfile(ChannelProfile.Communication);
        rtcEngine.setClientRole(ClientRole.Broadcaster);

        if (callType === "video") {
          await rtcEngine.enableVideo();
          await rtcEngine.startPreview();
        } else {
          await rtcEngine.disableVideo();
        }

        rtcEngine.addListener("Warning", (warn) => {
          console.warn("Agora warning", warn);
        });

        rtcEngine.addListener("Error", (error) => {
          console.error("Agora error", error);
          showToast("Agora connection problem");
        });

        rtcEngine.addListener("UserJoined", (uid) => {
          if (!isMounted) return;
          setPeerIds((current) => [...new Set([...current, uid])]);
        });

        rtcEngine.addListener("UserOffline", (offlineUid) => {
          setPeerIds((current) => current.filter((id) => id !== offlineUid));
        });

        rtcEngine.addListener("JoinChannelSuccess", async () => {
          if (!isMounted) return;
          setJoined(true);
          setCallStartTime(Date.now());

          try {
            const response = await startCallHistory(
              expert?.id,
              callType,
              channelName
            );
            if (response?.id) {
              setCallHistoryId(response.id);
            }
          } catch (err) {
            console.warn("Error starting call history:", err);
          }
        });

        await rtcEngine.joinChannel(token, channelName, null, Number(uid));
      } catch (error) {
        Alert.alert("Call failed", error.message || "Unable to start Agora call");
        navigation.goBack();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupAgora();

    return () => {
      isMounted = false;
      const engine = engineRef.current;
      if (engine) {
        engine.leaveChannel();
        engine.destroy();
      }
    };
  }, [channelName, callType, navigation, uid]);

  const toggleMute = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const nextMuted = !muted;
    await engine.muteLocalAudioStream(nextMuted);
    setMuted(nextMuted);
  };

  const toggleVideo = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const nextVideoEnabled = !videoEnabled;
    if (nextVideoEnabled) {
      await engine.enableVideo();
      await engine.startPreview();
    } else {
      await engine.disableVideo();
    }
    setVideoEnabled(nextVideoEnabled);
  };

  const handleEndCall = async () => {
    try {
      if (callHistoryId && callStartTime) {
        const durationSeconds = Math.round((Date.now() - callStartTime) / 1000);
        await endCallHistory(callHistoryId, durationSeconds, "ended by user");
      }
    } catch (err) {
      console.warn("Error ending call history:", err);
    } finally {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.statusText}>Connecting to Agora...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{expert?.business_name || "Consultation"}</Text>
        <Text style={styles.subtitle}>{callType === "video" ? "Video Call" : "Audio Call"}</Text>
      </View>

      {callType === "video" ? (
        <View style={styles.videoContainer}>
          <View style={styles.remoteVideoContainer}>
            {peerIds.length > 0 ? (
              <RtcRemoteView.SurfaceView
                style={styles.remoteVideo}
                uid={peerIds[0]}
                channelId={channelName}
                renderMode={VideoRenderMode.Hidden}
              />
            ) : (
              <View style={styles.emptyRemote}>
                <Text style={styles.emptyText}>Waiting for expert to join</Text>
              </View>
            )}
          </View>

          <View style={styles.localVideoContainer}>
            <RtcLocalView.SurfaceView style={styles.localVideo} channelId={channelName} renderMode={VideoRenderMode.Hidden} />
          </View>
        </View>
      ) : (
        <View style={styles.audioContainer}>
          <Text style={styles.audioLabel}>You are in an audio call</Text>
          <Text style={styles.audioSub}>Your voice is encrypted and routed through Agora</Text>
        </View>
      )}

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlText}>{muted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>
        {callType === "video" && (
          <TouchableOpacity style={styles.controlButton} onPress={toggleVideo}>
            <Text style={styles.controlText}>{videoEnabled ? "Stop Video" : "Start Video"}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Text style={[styles.controlText, styles.endCallText]}>End</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: 14,
    color: "#444",
    fontSize: 16,
  },
  header: {
    padding: 18,
    backgroundColor: "#111827",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#d1d5db",
    fontSize: 14,
  },
  videoContainer: {
    flex: 1,
  },
  remoteVideoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
  },
  localVideoContainer: {
    width: 120,
    height: 160,
    position: "absolute",
    right: 16,
    bottom: 120,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  localVideo: {
    flex: 1,
  },
  emptyRemote: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
  },
  audioContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  audioLabel: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  audioSub: {
    marginTop: 10,
    color: "#d1d5db",
    textAlign: "center",
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    minWidth: 100,
    alignItems: "center",
  },
  controlText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  endCallButton: {
    backgroundColor: "#ef4444",
  },
  endCallText: {
    color: "#fff",
  },
});
