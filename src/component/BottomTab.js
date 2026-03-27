import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";

import HomeScreen from "../screens/HomeScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

function DummyScreen() {
  return null;
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={DummyScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="clock" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="WalletScreen"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="credit-card" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
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