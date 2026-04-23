import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";

import HomeScreenDetails from "../screens/HomeScreenDetails";
import HistoryScreen from "../screens/HistoryScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

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
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="clock" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="credit-card" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="user" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
