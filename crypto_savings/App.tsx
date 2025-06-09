import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/auth/AuthProvider";
import Navigation from "./src/navigation";
import { NotificationProvider } from "./src/context/NotificationContext";
import * as Notifications from "expo-notifications";
import { UserProvider } from "./src/context/UserContext";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";
import { auth } from "./src/firebase/config";

export default function App() {
  const { API_URL } = Constants.expoConfig?.extra || {};
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
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
      const firebaseToken = await currentUser.getIdToken();

      await axios.post(
        `${API_URL}/api/user/push-token`,
        { token: expoPushToken },
        { headers: { Authorization: `Bearer ${firebaseToken}` } }
      );
    }
  };

  return (
    <PaperProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <Navigation />
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
