import React, { useState } from "react";
import { View } from "react-native";
import { Text, Button, ActivityIndicator, Card } from "react-native-paper";
import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthProvider";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function WalletScreen() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createWallet = async () => {
    setLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await axios.post(
        `${API_URL}/wallet/create`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWallet(res.data);
    } catch (error: any) {
      alert("Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : wallet ? (
        <Card>
          <Card.Title title="BTC Wallet" />
          <Card.Content>
            <Text>XPub:</Text>
            <Text selectable>{wallet.xpub}</Text>
          </Card.Content>
        </Card>
      ) : (
        <Button mode="contained" onPress={createWallet}>
          Create Wallet
        </Button>
      )}
    </View>
  );
}
