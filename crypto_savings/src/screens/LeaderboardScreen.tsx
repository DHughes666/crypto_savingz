import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, ActivityIndicator, Avatar } from "react-native-paper";
import Constants from "expo-constants";
import axios from "axios";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  totalSaved: number;
}

export default function LeaderboardScreen() {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/leaderboard`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
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
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        🏆 Top Savers Leaderboard
      </Text>

      {leaderboard.map((user, index) => (
        <Card key={user.id} style={{ marginBottom: 12, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar.Text
              size={40}
              label={(index + 1).toString()}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {user.name}
              </Text>
              <Text style={{ color: "#888" }}>{user.email}</Text>
              <Text style={{ marginTop: 4 }}>
                Total Saved: ${user.totalSaved.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
