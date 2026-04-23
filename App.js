import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/auth/LoginScreen";
import OTPScreen from "./src/auth/OtpScreen";
import BottomTabs from "./src/component/BottomTab";
import HomeScreenDetails from "./src/screens/HomeScreenDetails";
import HomeScreen from "./src/screens/HomeScreen";
import ExpertDetailsScreen from "./src/screens/ExpertDetailsScreen";
import ChatScreen from "./src/screens/ChatScreen";
import SplashScreen from "./src/screens/SpalashScreen";
import EmailLoginScreen from "./src/auth/EmailLoginScreen";
import SignupScreen from "./src/auth/SignUpScreen";
import WalletScreen from "./src/screens/WalletScreen";
import CashfreeTopupScreen from "./src/screens/CashfreeTopupScreen";
import AgoraCallScreen from "./src/screens/AgoraCallScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ForgotPassword from "./src/auth/ForgotPassword";
import PersonalInfo from "./src/screens/PersonalInfo";
import ProfileQR from "./src/screens/ProfileQr";
import Category from "./src/screens/Category";
import CallRates from "./src/screens/CallRates";
import BusinessDetails from "./src/screens/BusinessDetails";
import Schedule from "./src/screens/Schedule";
import Approval from "./src/screens/Approval";
import Verification from "./src/screens/Verification";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import FavoriteScreen from "./src/screens/Favorite";
import ShareProfile from "./src/screens/ShareProfile";
import About from "./src/screens/About";
import Support from "./src/screens/Support";
import Privacy from "./src/screens/Privacy";
import DeleteAccountReasons from "./src/screens/DeleteAccountReasons";
import DeleteAccountFeedback from "./src/screens/DeleteAccountFeedback";
import ToastHost from "./src/component/ToastHost";

const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ["previewtax://", "https://previewtax.com"],
  config: {
    screens: {
      ExpertDetailsScreen: "expert/:uid",
    },
  },
};

export default function App() {
  return (
    <>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreenDetails"
          component={HomeScreenDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExpertDetailsScreen"
          component={ExpertDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailLogin"
          component={EmailLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="WalletTopup" component={CashfreeTopupScreen} />
        <Stack.Screen name="Call" component={AgoraCallScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfo}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileQR"
          component={ProfileQR}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Category"
          component={Category}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CallRates"
          component={CallRates}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BusinessDetails"
          component={BusinessDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Schedule"
          component={Schedule}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Approval"
          component={Approval}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verification"
          component={Verification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Favorite"
          component={FavoriteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShareProfile"
          component={ShareProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="About"
          component={About}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Privacy"
          component={Privacy}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeleteAccountReasons"
          component={DeleteAccountReasons}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DeleteAccountFeedback"
          component={DeleteAccountFeedback}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: false }}
        />
        </Stack.Navigator>
      </NavigationContainer>
      <ToastHost />
    </>
  );
}
