/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import axios from "axios";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { router } from "expo-router";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { firebaseErrorMessages } from "../utils/firebaseError";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Toast.show({ type: "error", text1: "Invalid email format" });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      await axios.post(
        `${API_URL}/api/user/register`,
        { email: user.email, firebaseId: user.uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast.show({ type: "success", text1: "Login successful" });
      router.replace("/");
    } catch (err: any) {
      const code = err?.code || "";
      const friendlyMessage =
        firebaseErrorMessages[code] || "Login failed. Please try again.";
      if (!firebaseErrorMessages[code]) {
        console.error("Unhandled Firebase error:", err);
      }

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: friendlyMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", padding: 20 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
          Welcome Back 👋
        </Text>

        <TextInput
          label="Email"
          value={email}
          mode="outlined"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Password"
          value={password}
          mode="outlined"
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: 20 }}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password}
        >
          Sign In
        </Button>
        <Button
          onPress={() => router.push("/signup")}
          style={{ marginTop: 10 }}
        >
          Don't have an account? Sign Up
        </Button>
        <Button
          onPress={() => router.push("/forgot-password")}
          style={{ marginTop: 5 }}
          mode="text"
        >
          Forgot Password?
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
