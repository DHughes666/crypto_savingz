import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import Toast from "react-native-toast-message";
import { router, useLocalSearchParams } from "expo-router";

export default function OTPVerification() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyOTP = async () => {
    setLoading(true);
    try {
      // Simulate OTP check
      if (otp !== "123456") {
        Toast.show({ type: "error", text1: "Invalid OTP" });
      } else {
        Toast.show({ type: "success", text1: "OTP verified" });
        router.push({ pathname: "/reset-confirmation", params: { email } });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      Toast.show({ type: "error", text1: "OTP verification failed" });
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
          Enter OTP
        </Text>
        <TextInput
          label="6-digit OTP"
          value={otp}
          mode="outlined"
          onChangeText={setOtp}
          keyboardType="numeric"
          style={{ marginBottom: 20 }}
          maxLength={6}
        />
        <Button mode="contained" onPress={verifyOTP} loading={loading}>
          Verify OTP
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
