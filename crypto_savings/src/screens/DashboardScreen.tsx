import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

interface Saving {
  amount: number;
  crypto: string;
  timestamp: string;
}

export default function DashboardScreen({ navigation, route }: any) {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavings = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("User not authenticated");
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await axios.get(
        `${API_URL}/api/user/savings`, // Replace IP if needed
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSavings(res.data);
    } catch (err) {
      console.error("Failed to fetch savings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/user/ping`)
      .then((res) => console.log("Ping response:", res.data))
      .catch((err) => console.error("Ping failed:", err));
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchSavings();
      else setLoading(false);
    });

    if (route?.params?.refresh) {
      fetchSavings();
      navigation.setParams({ refresh: false });
    }
    return unsubscribe;
  }, [route?.params?.refresh]);

  const groupByCoin = (data: Saving[]) => {
    return data.reduce((acc: Record<string, number>, curr) => {
      acc[curr.crypto] = (acc[curr.crypto] || 0) + curr.amount;
      return acc;
    }, {});
  };

  const total = savings.reduce((sum, s) => sum + s.amount, 0);
  const grouped = groupByCoin(savings);

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
        Your Crypto Savings
      </Text>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text>Total Saved: ${total.toFixed(2)}</Text>
      </Card>

      {Object.entries(grouped).map(([coin, amount]) => (
        <Card key={coin} style={{ marginBottom: 12, padding: 16 }}>
          <Text>
            {coin}: ${amount.toFixed(2)}
          </Text>
        </Card>
      ))}
      <Button
        mode="outlined"
        onPress={() => navigation.navigate("AddSaving")}
        style={{ marginTop: 20 }}
      >
        Add New Saving
      </Button>

      <Button
        mode="contained"
        onPress={() => auth.signOut()}
        style={{ marginTop: 30 }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}
