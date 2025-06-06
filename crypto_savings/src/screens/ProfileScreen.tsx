import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, ActivityIndicator, Button } from "react-native-paper";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

interface Saving {
  amount: number;
  crypto: string;
  timestamp: string;
}

interface UserProfile {
  email: string;
  createdAt: string;
  savings: Saving[];
}

export default function ProfileScreen({ navigation }: any) {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ padding: 20 }}>
        <Text variant="bodyMedium">Failed to load profile data.</Text>
      </View>
    );
  }

  const { email, createdAt, savings } = profile;
  const totalUsd = savings.reduce((sum, s) => sum + s.amount, 0);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        Profile
      </Text>

      <Card style={{ marginBottom: 12, padding: 16 }}>
        <Text>Email: {email}</Text>
        <Text>Joined: {new Date(createdAt).toDateString()}</Text>
      </Card>

      <Card style={{ marginBottom: 12, padding: 16 }}>
        <Text variant="titleMedium">Total Saved</Text>
        <Text style={{ fontWeight: "bold", marginTop: 8 }}>
          ${totalUsd.toFixed(2)}
        </Text>
      </Card>

      <Card style={{ marginBottom: 12, padding: 16 }}>
        <Text variant="titleMedium">Breakdown</Text>
        {savings.length === 0 ? (
          <Text style={{ color: "#888" }}>No savings yet.</Text>
        ) : (
          savings.map((s, index) => (
            <Text key={index} style={{ marginTop: 4 }}>
              • {s.crypto}: ${s.amount.toFixed(2)} on{" "}
              {new Date(s.timestamp).toLocaleDateString()}
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
    </ScrollView>
  );
}
