import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import axios from "axios";
import { auth } from "../firebase/config";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function SendNotificationScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const sendNotification = async () => {
    if (!title || !message) {
      Alert.alert("Missing fields", "Please fill both title and message.");
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();

      await axios.post(
        `${API_URL}/api/admin/send-notification`,
        { title, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackVisible(true);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send notification:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Send Notification
      </Text>

      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={{ marginBottom: 12 }}
        mode="outlined"
      />

      <TextInput
        label="Message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        style={{ marginBottom: 16 }}
        mode="outlined"
      />

      <Button
        mode="contained"
        loading={loading}
        onPress={sendNotification}
        disabled={loading}
      >
        Send to All Users
      </Button>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        ✅ Notification sent!
      </Snackbar>
    </View>
  );
}
