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
import { useUnifiedAuth } from "../context/UnifiedAuthProvider"; // ✅ updated import

const { API_URL } = Constants.expoConfig?.extra || {};

export default function ProfileScreen({ navigation }: any) {
  const { userProfile, loading, refreshUserProfile } = useUnifiedAuth(); // ✅ updated hook

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
    }
  }, [userProfile]);

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
      await refreshUserProfile(); // ✅ updated method
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Profile update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const changesMade =
    userProfile &&
    (firstName !== userProfile.firstName || lastName !== userProfile.lastName);

  if (loading || !userProfile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalUsd =
    userProfile.savings?.reduce((sum: number, s: any) => sum + s.amount, 0) ||
    0;
  const isAdmin = userProfile?.role === "admin";

  const streak = userProfile.streakCount || 0;
  const lastSaved = userProfile.lastSavedDate
    ? new Date(userProfile.lastSavedDate)
    : null;

  const getCelebrationEmoji = (days: number) => {
    if (days >= 30) return "🏆";
    if (days >= 7) return "🎊";
    if (days >= 3) return "🔥";
    return "👏";
  };

  const celebration = streak > 0 ? getCelebrationEmoji(streak) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Profile
      </Text>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <TextInput label="Email" value={userProfile.email} disabled />
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

      {streak > 0 && (
        <Card
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: "#e8f5e9",
          }}
        >
          <Text variant="titleMedium">
            {celebration} {streak}-Day Savings Streak!
          </Text>
          {lastSaved && (
            <Text style={{ color: "#555", marginTop: 4 }}>
              Last saved: {lastSaved.toLocaleDateString()}{" "}
              {lastSaved.toLocaleTimeString()}
            </Text>
          )}
          <Text style={{ marginTop: 4, color: "#2e7d32" }}>
            Keep it going to earn bonuses!
          </Text>
        </Card>
      )}

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium">Savings History</Text>
        {userProfile.savings?.length === 0 ? (
          <Text style={{ color: "#888" }}>No savings yet.</Text>
        ) : (
          [...userProfile.savings]
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
      {isAdmin && (
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("SendNotification")}
          style={{ marginBottom: 10 }}
        >
          Send Notification (Admin)
        </Button>
      )}

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
