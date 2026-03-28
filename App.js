import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingScreen from "./src/auth/OnboardingScreen";
import LoginScreen from "./src/auth/LoginScreen";
import OTPScreen from "./src/auth/OtpScreen";
import BottomTabs from "./src/component/BottomTab";
import HomeScreenDetails from "./src/screens/HomeScreenDetails";
import HomeScreen from "./src/screens/HomeScreen";
import ExpertDetailsScreen from "./src/screens/ExpertDetailsScreen";
import ChatScreen  from "./src/screens/ChatScreen"
import SlotBookingScreen from "./src/screens/SlotBookingScreen";
import SplashScreen  from "./src/screens/SpalashScreen";
import EmailLoginScreen from "./src/auth/EmailLoginScreen";
import  SignupScreen from "./src/auth/SignUpScreen";
import WalletScreen from "./src/screens/WalletScreen";
import ProfileScreen   from "./src/screens/ProfileScreen";
import ForgotPassword  from "./src/auth/ForgotPassword";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">

        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ headerShown: false }} />
           
        {/* 🔥 MAIN APP */}
        < Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: true }} />
        <Stack.Screen name="MainApp" component={BottomTabs} options={{ headerShown: false }} />

        <Stack.Screen name="HomeScreenDetails" component={HomeScreenDetails} options={{headerShown:false}}/>
        <Stack.Screen name="ExpertDetailsScreen" component={ExpertDetailsScreen}/>
         <Stack.Screen name="Chat" component={ChatScreen} />
         <Stack.Screen name="Booking" component={SlotBookingScreen} />
          <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}} />
           <Stack.Screen name="EmailLogin" component={EmailLoginScreen} options={{headerShown:false}} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown:false}} />
           <Stack.Screen name="WalletScreen" component={WalletScreen} />
           <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
           <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}