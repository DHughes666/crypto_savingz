/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/"); // redirect to home/dashboard
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <Button onPress={() => router.push("/signup")} style={{ marginTop: 10 }}>
        Don't have an account? Sign Up
      </Button>
    </KeyboardAvoidingView>
  );
}
