import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, ActivityIndicator, Avatar } from "react-native-paper";
import axios from "axios";
import { auth } from "../firebase/config";
import Constants from "expo-constants";

export default function ProfileScreen() {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
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

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <Avatar.Text label={profile.email.charAt(0).toUpperCase()} size={48} />
        <Text variant="titleLarge" style={{ marginTop: 10 }}>
          {profile.email}
        </Text>
        <Text>Total Entries: {profile.savings.length}</Text>
      </Card>

      {profile.savings.map((s: any, i: number) => (
        <Card key={i} style={{ marginBottom: 10, padding: 16 }}>
          <Text>
            {s.crypto}: ${s.amount.toFixed(2)}
          </Text>
          <Text>{new Date(s.timestamp).toLocaleString()}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
