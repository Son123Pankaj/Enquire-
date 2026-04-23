import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  DeviceEventEmitter,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { toastEventName } from "../utils/toast";

export default function ToastHost() {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      toastEventName,
      ({ message, duration = 2400, type = "warning" }) => {
        if (!message) {
          return;
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setToast({ message, type });

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start();

        timeoutRef.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 16,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => setToast(null));
        }, duration);
      }
    );

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [opacity, translateY]);

  if (!toast) {
    return null;
  }

  const toneStyles = toneMap[toast.type] || toneMap.warning;
  const iconName = iconMap[toast.type] || iconMap.warning;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          toneStyles.toast,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.iconWrap, toneStyles.iconWrap]}>
          <Icon name={iconName} size={16} color={toneStyles.iconColor} />
        </View>
        <Text style={[styles.message, toneStyles.message]}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

const toneMap = {
  success: {
    toast: {
      borderBottomColor: "#16a34a",
    },
    iconWrap: {
      backgroundColor: "#dcfce7",
    },
    message: {
      color: "#166534",
    },
    iconColor: "#16a34a",
  },
  error: {
    toast: {
      borderBottomColor: "#dc2626",
    },
    iconWrap: {
      backgroundColor: "#fee2e2",
    },
    message: {
      color: "#991b1b",
    },
    iconColor: "#dc2626",
  },
  warning: {
    toast: {
      borderBottomColor: "#f59e0b",
    },
    iconWrap: {
      backgroundColor: "#fef3c7",
    },
    message: {
      color: "#9a3412",
    },
    iconColor: "#d97706",
  },
};

const iconMap = {
  success: "check-circle",
  error: "x-circle",
  warning: "alert-triangle",
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 18,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffedd5",
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
  },
});
