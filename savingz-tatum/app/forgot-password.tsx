import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email.includes("@")) {
      Toast.show({ type: "error", text1: "Enter a valid email" });
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP dispatch
      Toast.show({ type: "success", text1: "OTP sent to email" });
      router.push({ pathname: "/otp-verification", params: { email } });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", padding: 20 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
          Forgot Password 🔐
        </Text>
        <TextInput
          label="Email"
          value={email}
          mode="outlined"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ marginBottom: 20 }}
        />
        <Button mode="contained" onPress={handleRequestOTP} loading={loading}>
          Send OTP
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
