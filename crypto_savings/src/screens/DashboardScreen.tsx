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
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  const [priceChangeMap, setPriceChangeMap] = useState<Record<string, number>>(
    {}
  );
  const [usdToNgn, setUsdToNgn] = useState<number>(0);

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

  const fetchPrices = async () => {
    try {
      const ids = ["bitcoin", "ethereum", "tether", "solana", "binancecoin"];
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: ids.join(","),
            vs_currencies: "usd",
            include_24hr_change: true,
          },
        }
      );

      const map: Record<string, number> = {
        BTC: res.data.bitcoin.usd,
        ETH: res.data.ethereum.usd,
        USDT: res.data.tether.usd,
        SOL: res.data.solana.usd,
        BNB: res.data.binancecoin.usd,
      };

      const changeMap: Record<string, number> = {
        BTC: res.data.bitcoin.usd_24h_change,
        ETH: res.data.ethereum.usd_24h_change,
        USDT: res.data.tether.usd_24h_change,
        SOL: res.data.solana.usd_24h_change,
        BNB: res.data.binancecoin.usd_24h_change,
      };

      setPriceMap(map);
      setPriceChangeMap(changeMap);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    }
  };

  const fetchUsdToNgnRate = async () => {
    try {
      const res = await axios.get(
        "https://api.exchangerate.host/latest?base=USD&symbols=NGN"
      );
      setUsdToNgn(res.data.rates.NGN);
    } catch (err) {
      console.error("Failed to fetch USD→NGN rate:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSavings();
        fetchPrices();
        fetchUsdToNgnRate();
        const interval = setInterval(() => {
          fetchPrices();
          fetchUsdToNgnRate();
        }, 5 * 60 * 1000); // every 5 min
        return () => clearInterval(interval);
      } else {
        setLoading(false);
      }
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
  const totalUsd = savings.reduce((sum, s) => {
    const price = priceMap[s.crypto] || 0;
    return sum + s.amount * price;
  }, 0);

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
        <Text>Total Saved (in crypto): ${total.toFixed(2)}</Text>
        <Text style={{ color: "#888", marginTop: 4 }}>
          ≈ ${totalUsd.toFixed(2)} / ₦
          {(totalUsd * usdToNgn).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </Text>
      </Card>

      {Object.entries(grouped).map(([coin, amount]) => {
        const price = priceMap[coin] || 0;
        const usdValue = price * amount;
        const ngnValue = usdValue * usdToNgn;
        const change = priceChangeMap[coin];

        return (
          <Card key={coin} style={{ marginBottom: 12, padding: 16 }}>
            <Text>
              {coin}: {amount.toFixed(4)}
            </Text>
            <Text style={{ color: "#555", marginTop: 4 }}>
              ≈ ${usdValue.toFixed(2)} / ₦
              {ngnValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Text>
            {change !== undefined && (
              <Text
                style={{ color: change >= 0 ? "green" : "red", marginTop: 4 }}
              >
                24h: {change.toFixed(2)}%
              </Text>
            )}
          </Card>
        );
      })}

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
