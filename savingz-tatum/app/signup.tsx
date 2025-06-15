import React, { useState } from "react";
import axios from "axios";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { router } from "expo-router";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (password !== confirm) return alert("Passwords do not match");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const token = await user.getIdToken();

      await axios.post(
        `${API_URL}/api/user/register`,
        {
          email: user.email,
          firebaseId: user.uid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("User registered in backend");
      setError("");
      // Optionally navigate to dashboard
      // navigation.navigate("Dashboard");
      router.replace("/");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed");
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
          Create Account 🚀
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
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Confirm Password"
          value={confirm}
          mode="outlined"
          onChangeText={setConfirm}
          secureTextEntry
          style={{ marginBottom: 20 }}
        />
        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={!email || !password || password !== confirm}
        >
          Sign Up
        </Button>
        <Button onPress={() => router.push("/login")} style={{ marginTop: 10 }}>
          Already have an account? Sign In
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
