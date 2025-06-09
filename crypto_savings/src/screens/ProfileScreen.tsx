import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";
import { useUser } from "../context/UserContext";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function ProfileScreen({ navigation }: any) {
  const { user, loading, refreshUser } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const updateProfile = async () => {
    try {
      setUpdating(true);
      const token = await auth.currentUser?.getIdToken();
      await axios.post(
        `${API_URL}/api/user/profile/update`,
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbarVisible(true);
      await refreshUser(); // sync latest info
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Profile update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const changesMade =
    user && (firstName !== user.firstName || lastName !== user.lastName);

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalUsd =
    user.savings?.reduce((sum: number, s: any) => sum + s.amount, 0) || 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Profile
      </Text>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <TextInput label="Email" value={user.email} disabled />
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={{ marginTop: 12 }}
        />
        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={{ marginTop: 12 }}
        />
        {changesMade && (
          <Button
            mode="contained"
            onPress={updateProfile}
            loading={updating}
            style={{ marginTop: 16 }}
          >
            Save Changes
          </Button>
        )}
      </Card>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium">Total Saved</Text>
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>
          ${totalUsd.toFixed(2)}
        </Text>
      </Card>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium">Savings History</Text>
        {user.savings?.length === 0 ? (
          <Text style={{ color: "#888" }}>No savings yet.</Text>
        ) : (
          [...user.savings]
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .slice(0, 8)
            .map((s: any, i: number) => (
              <Text key={i} style={{ marginTop: 4 }}>
                • {s.crypto}: ${s.amount.toFixed(2)} on{" "}
                {new Date(s.timestamp).toLocaleString()}
              </Text>
            ))
        )}
      </Card>

      <View style={{ marginTop: 20 }}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Dashboard")}
          style={{ marginBottom: 10 }}
        >
          Back to Dashboard
        </Button>

        <Button mode="contained" onPress={() => auth.signOut()}>
          Logout
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Profile updated successfully!
      </Snackbar>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
}
