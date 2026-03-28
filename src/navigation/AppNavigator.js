import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/ProfileScreen";

// 👇 IMPORT ALL SCREENS
import PersonalInfo from "../screens/Profile/PersonalInfo";
import ShareProfile from "../screens/Profile/ShareProfile";
import ProfileQR from "../screens/Profile/ProfileQR";
import BusinessDetails from "../screens/Business/BusinessDetails";
import Category from "../screens/Business/Category";
import Schedule from "../screens/Business/Schedule";
import CallRates from "../screens/Business/CallRates";
import Approval from "../screens/Business/Approval";
import Verification from "../screens/Business/Verification";
import Favorite from "../screens/Settings/Favorite";
import About from "../screens/Settings/About";
import Privacy from "../screens/Settings/Privacy";
import Support from "../screens/Settings/Support";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* 👇 ADD ALL THESE */}
      <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
      <Stack.Screen name="ShareProfile" component={ShareProfile} />
      <Stack.Screen name="ProfileQR" component={ProfileQR} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetails} />
      <Stack.Screen name="Category" component={Category} />
      <Stack.Screen name="Schedule" component={Schedule} />
      <Stack.Screen name="CallRates" component={CallRates} />
      <Stack.Screen name="Approval" component={Approval} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="Favorite" component={Favorite} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="Support" component={Support} />
    </Stack.Navigator>
  );
};

export default AppNavigator;