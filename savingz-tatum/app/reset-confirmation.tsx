import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Text, Button } from "react-native-paper";
import { sendPasswordResetEmail } from "firebase/auth";
import { useLocalSearchParams, router } from "expo-router";
import { auth } from "../lib/firebaseConfig";
import Toast from "react-native-toast-message";

export default function ResetConfirmation() {
  const { email } = useLocalSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email as string);
      Toast.show({ type: "success", text1: "Reset email sent!" });
      setTimeout(() => router.replace("/login"), 3000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to send reset email" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 20 }}>
        Password Reset Email Sent ✅
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Please check your email inbox to reset your password for: {email}
      </Text>
      <Button onPress={() => router.replace("/login")} mode="outlined">
        Back to Login
      </Button>
    </View>
  );
}
