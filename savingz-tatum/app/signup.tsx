import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { router } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirm) return alert("Passwords do not match");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/");
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
  );
}
