import React from "react";
import { DeviceEventEmitter } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";

import HomeScreenDetails from "../screens/HomeScreenDetails";
import HistoryScreen from "../screens/HistoryScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const createTabListeners = (routeName) => ({ navigation }) => ({
  tabPress: () => {
    if (navigation.isFocused()) {
      DeviceEventEmitter.emit("REFRESH_TAB_PAGE", routeName);
    }
  },
});

const renderHomeIcon = ({ color }) => <Icon name="home" size={22} color={color} />;
const renderHistoryIcon = ({ color }) => <Icon name="clock" size={22} color={color} />;
const renderWalletIcon = ({ color }) => <Icon name="credit-card" size={22} color={color} />;
const renderProfileIcon = ({ color }) => <Icon name="user" size={22} color={color} />;

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { height: 60, borderTopWidth: 0.5, borderTopColor: "#e5e7eb" },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreenDetails}
        listeners={createTabListeners("HomeTab")}
        options={{
          tabBarIcon: renderHomeIcon,
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        listeners={createTabListeners("History")}
        options={{
          tabBarIcon: renderHistoryIcon,
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        listeners={createTabListeners("Wallet")}
        options={{
          tabBarIcon: renderWalletIcon,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={createTabListeners("Profile")}
        options={{
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}
