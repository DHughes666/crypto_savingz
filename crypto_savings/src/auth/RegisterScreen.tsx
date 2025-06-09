import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
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
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Register</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={register}
        style={{ marginVertical: 10 }}
      >
        Register
      </Button>
      <Button onPress={() => navigation.navigate("Login")}>
        Already have an account? Login
      </Button>
    </SafeAreaView>
  );
}
