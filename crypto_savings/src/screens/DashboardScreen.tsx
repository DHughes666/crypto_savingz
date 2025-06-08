import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

interface Saving {
  amount: number; // USD
  crypto: string;
  cryptoQty?: number; // New (optional, for future use)
  timestamp: string;
}

export default function DashboardScreen({ navigation, route }: any) {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceError, setPriceError] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [priceNgnMap, setPriceNgnMap] = useState<Record<string, number>>({});
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
      const res = await axios.get(`${API_URL}/api/user/savings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ If user has no savings, res.data should be an empty array
      if (Array.isArray(res.data)) {
        setSavings(res.data);
      } else {
        console.warn("Unexpected response format:", res.data);
        setSavings([]); // fallback
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // ✅ No savings found (but user exists) — treat as empty state
        console.info("No savings found — treating as empty");
        setSavings([]);
      } else {
        console.error("Failed to fetch savings:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const ids = [
        "bitcoin",
        "ethereum",
        "tether",
        "solana",
        "binancecoin",
        "ripple", // XRP
        "pumpai", // PUMPAI
        "hamster", // HMSTR
      ];

      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
          params: {
            ids: ids.join(","),
            vs_currencies: "usd,ngn",
            include_24hr_change: true,
          },
        }
      );

      // 🔒 Helper to safely access nested values with fallback
      const safeGet = (obj: any, path: string[], fallback = 0) =>
        path.reduce(
          (o, key) => (o?.[key] !== undefined ? o[key] : fallback),
          obj
        );

      const usdMap: Record<string, number> = {
        BTC: safeGet(res.data, ["bitcoin", "usd"]),
        ETH: safeGet(res.data, ["ethereum", "usd"]),
        USDT: safeGet(res.data, ["tether", "usd"]),
        SOL: safeGet(res.data, ["solana", "usd"]),
        BNB: safeGet(res.data, ["binancecoin", "usd"]),
        XRP: safeGet(res.data, ["ripple", "usd"]),
        PUMPAI: safeGet(res.data, ["pumpai", "usd"]),
        HMSTR: safeGet(res.data, ["hamster", "usd"]),
      };

      const ngnMap: Record<string, number> = {
        BTC: safeGet(res.data, ["bitcoin", "ngn"]),
        ETH: safeGet(res.data, ["ethereum", "ngn"]),
        USDT: safeGet(res.data, ["tether", "ngn"]),
        SOL: safeGet(res.data, ["solana", "ngn"]),
        BNB: safeGet(res.data, ["binancecoin", "ngn"]),
        XRP: safeGet(res.data, ["ripple", "ngn"]),
        PUMPAI: safeGet(res.data, ["pumpai", "ngn"]),
        HMSTR: safeGet(res.data, ["hamster", "ngn"]),
      };

      const changeMap: Record<string, number> = {
        BTC: safeGet(res.data, ["bitcoin", "usd_24h_change"]),
        ETH: safeGet(res.data, ["ethereum", "usd_24h_change"]),
        USDT: safeGet(res.data, ["tether", "usd_24h_change"]),
        SOL: safeGet(res.data, ["solana", "usd_24h_change"]),
        BNB: safeGet(res.data, ["binancecoin", "usd_24h_change"]),
        XRP: safeGet(res.data, ["ripple", "usd_24h_change"]),
        PUMPAI: safeGet(res.data, ["pumpai", "usd_24h_change"]),
        HMSTR: safeGet(res.data, ["hamster", "usd_24h_change"]),
      };

      setPriceMap(usdMap);
      setPriceNgnMap(ngnMap);
      setPriceChangeMap(changeMap);
    } catch (err) {
      console.error("Failed to fetch prices from CoinGecko:", err);
      setPriceError(true); // ⚠️ Trigger UI warning
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSavings();
        fetchPrices();
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
  const totalUsd = total; // it's already in USD
  const totalNgn = savings.reduce((sum, s) => {
    const ngnPrice = priceNgnMap[s.crypto] || 0;
    const cryptoAmount = s.amount / (priceMap[s.crypto] || 1);
    return sum + cryptoAmount * ngnPrice;
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
      {priceError && (
        <Card
          style={{ backgroundColor: "#fff3cd", padding: 12, marginBottom: 16 }}
        >
          <Text style={{ color: "#856404" }}>
            ⚠️ Live prices could not be fetched. Displayed values may be
            outdated.
          </Text>
        </Card>
      )}

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text>Total Saved: ${totalUsd.toFixed(2)}</Text>
        <Text style={{ color: "#888", marginTop: 4 }}>
          ≈ ₦{totalNgn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </Card>

      {Object.entries(grouped).map(([coin, usdAmount]) => {
        const usdPrice = priceMap[coin] || 1; // fallback to 1 to avoid NaN
        const ngnPrice = priceNgnMap[coin] || 0;
        const cryptoAmount = usdAmount / usdPrice;
        const ngnValue = cryptoAmount * ngnPrice;
        const change = priceChangeMap[coin];

        return (
          <Card key={coin} style={{ marginBottom: 12, padding: 16 }}>
            <Text>
              {coin}: ${usdAmount.toFixed(2)}
            </Text>
            <Text style={{ color: "#555", marginTop: 4 }}>
              ≈ ₦
              {ngnValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              ~ ({cryptoAmount.toFixed(6)} {coin})
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
    </ScrollView>
  );
}
