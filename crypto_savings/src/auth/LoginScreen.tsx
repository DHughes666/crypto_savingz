import React, { useState } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import axios from "axios";
import GoogleSignIn from "./GoogleSignIn";
import Constants from "expo-constants";

export default function LoginScreen({ navigation }: any) {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
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
        {
          email: user.email,
          firebaseId: user.uid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("User successfully registered in Neon DB");
      setError("");

      // Navigate to your dashboard or home screen
      // navigation.navigate("Dashboard");
    } catch (err: any) {
      console.error("Login or registration error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <>
      <View style={{ padding: 20 }}>
        <Text variant="titleLarge">Login</Text>
        <TextInput label="Email" value={email} onChangeText={setEmail} />
        <TextInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Button mode="contained" onPress={login} style={{ marginVertical: 10 }}>
          Login
        </Button>
        <Button onPress={() => navigation.navigate("Register")}>
          No account? Register
        </Button>
      </View>
      <GoogleSignIn />
    </>
  );
}
