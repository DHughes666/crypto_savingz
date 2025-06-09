import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { UnifiedAuthProvider } from "./src/context/UnifiedAuthProvider";
import { NotificationProvider } from "./src/context/NotificationContext";
import Navigation from "./src/navigation";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";
import { auth } from "./src/firebase/config";

const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  const expoPushToken = tokenData.data;
  const currentUser = auth.currentUser;

  if (currentUser) {
    try {
      const firebaseToken = await currentUser.getIdToken();
      await axios.post(
        `${Constants.expoConfig?.extra?.API_URL}/api/user/push-token`,
        { token: expoPushToken },
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );
    } catch (error) {
      console.error("Error sending push token to backend:", error);
    }
  }
};

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <PaperProvider>
      <UnifiedAuthProvider>
        <NotificationProvider>
          <Navigation />
        </NotificationProvider>
      </UnifiedAuthProvider>
    </PaperProvider>
  );
}
