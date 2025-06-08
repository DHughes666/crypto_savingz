import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import Constants from "expo-constants";
import { auth } from "../firebase/config";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function NotificationsScreen() {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/api/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        console.warn("Unexpected notifications response:", res.data);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Notifications
      </Text>

      {notifications.length === 0 ? (
        <Card style={{ padding: 16 }}>
          <Text>No notifications yet.</Text>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card key={n.id} style={{ marginBottom: 12, padding: 16 }}>
            <Text style={{ fontWeight: "bold" }}>{n.title}</Text>
            <Text style={{ marginTop: 4 }}>{n.message}</Text>
            <Text style={{ color: "#888", marginTop: 6 }}>
              {new Date(n.createdAt).toLocaleString()}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
