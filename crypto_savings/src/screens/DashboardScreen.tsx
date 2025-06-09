import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import { useUnifiedAuth } from "../context/UnifiedAuthProvider"; // ✅ NEW
import axios from "axios";
import Constants from "expo-constants";

const { API_URL } = Constants.expoConfig?.extra || {};

export default function DashboardScreen({ navigation, route }: any) {
  const {
    userProfile,
    loading: userLoading,
    refreshUserProfile,
  } = useUnifiedAuth(); // ✅ UPDATED HOOK

  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [priceNgnMap, setPriceNgnMap] = useState<Record<string, number>>({});
  const [priceChangeMap, setPriceChangeMap] = useState<Record<string, number>>(
    {}
  );
  const [priceError, setPriceError] = useState(false);

  const fetchPrices = async () => {
    try {
      const ids = [
        "bitcoin",
        "ethereum",
        "tether",
        "solana",
        "binancecoin",
        "ripple",
        "pumpai",
        "hamster",
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

      const safeGet = (obj: any, path: string[], fallback = 0) =>
        path.reduce(
          (o, key) => (o?.[key] !== undefined ? o[key] : fallback),
          obj
        );

      setPriceMap({
        BTC: safeGet(res.data, ["bitcoin", "usd"]),
        ETH: safeGet(res.data, ["ethereum", "usd"]),
        USDT: safeGet(res.data, ["tether", "usd"]),
        SOL: safeGet(res.data, ["solana", "usd"]),
        BNB: safeGet(res.data, ["binancecoin", "usd"]),
        XRP: safeGet(res.data, ["ripple", "usd"]),
        PUMPAI: safeGet(res.data, ["pumpai", "usd"]),
        HMSTR: safeGet(res.data, ["hamster", "usd"]),
      });

      setPriceNgnMap({
        BTC: safeGet(res.data, ["bitcoin", "ngn"]),
        ETH: safeGet(res.data, ["ethereum", "ngn"]),
        USDT: safeGet(res.data, ["tether", "ngn"]),
        SOL: safeGet(res.data, ["solana", "ngn"]),
        BNB: safeGet(res.data, ["binancecoin", "ngn"]),
        XRP: safeGet(res.data, ["ripple", "ngn"]),
        PUMPAI: safeGet(res.data, ["pumpai", "ngn"]),
        HMSTR: safeGet(res.data, ["hamster", "ngn"]),
      });

      setPriceChangeMap({
        BTC: safeGet(res.data, ["bitcoin", "usd_24h_change"]),
        ETH: safeGet(res.data, ["ethereum", "usd_24h_change"]),
        USDT: safeGet(res.data, ["tether", "usd_24h_change"]),
        SOL: safeGet(res.data, ["solana", "usd_24h_change"]),
        BNB: safeGet(res.data, ["binancecoin", "usd_24h_change"]),
        XRP: safeGet(res.data, ["ripple", "usd_24h_change"]),
        PUMPAI: safeGet(res.data, ["pumpai", "usd_24h_change"]),
        HMSTR: safeGet(res.data, ["hamster", "usd_24h_change"]),
      });
    } catch (err) {
      console.error("Failed to fetch price data:", err);
      setPriceError(true);
    }
  };

  useEffect(() => {
    fetchPrices();
    if (route?.params?.refresh) {
      refreshUserProfile(); // ✅ NEW
      navigation.setParams({ refresh: false });
    }
  }, [route?.params?.refresh]);

  if (userLoading || !userProfile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const savings = userProfile.savings || [];
  const groupByCoin = savings.reduce(
    (acc: Record<string, number>, curr: any) => {
      acc[curr.crypto] = (acc[curr.crypto] || 0) + curr.amount;
      return acc;
    },
    {}
  );

  const totalUsd = savings.reduce((sum, s) => sum + s.amount, 0);
  const totalNgn = savings.reduce((sum, s) => {
    const usdPrice = priceMap[s.crypto] || 1;
    const ngnPrice = priceNgnMap[s.crypto] || 0;
    const cryptoQty = s.amount / usdPrice;
    return sum + cryptoQty * ngnPrice;
  }, 0);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        Welcome {userProfile.firstName || `User_${userProfile.id}`}
      </Text>

      {priceError && (
        <Card
          style={{ backgroundColor: "#fff3cd", padding: 12, marginBottom: 16 }}
        >
          <Text style={{ color: "#856404" }}>
            ⚠️ Live prices could not be fetched. Values may be outdated.
          </Text>
        </Card>
      )}

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text>Total Saved: ${totalUsd.toFixed(2)}</Text>
        <Text style={{ color: "#888", marginTop: 4 }}>
          ≈ ₦{totalNgn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </Text>
      </Card>

      {Object.entries(groupByCoin).map(([coin, usdAmount]) => {
        const usdPrice = priceMap[coin] || 1;
        const ngnPrice = priceNgnMap[coin] || 0;
        const cryptoQty = usdAmount / usdPrice;
        const nairaValue = cryptoQty * ngnPrice;
        const change = priceChangeMap[coin];

        return (
          <Card key={coin} style={{ marginBottom: 12, padding: 16 }}>
            <Text>
              {coin}: ${usdAmount.toFixed(2)}
            </Text>
            <Text style={{ color: "#555", marginTop: 4 }}>
              ≈ ₦
              {nairaValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              ~ ({cryptoQty.toFixed(6)} {coin})
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

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium">Savings History</Text>
        {savings.length === 0 ? (
          <Text style={{ color: "#888" }}>No savings yet.</Text>
        ) : (
          [...savings]
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
            .slice(0, 4)
            .map((s, i) => (
              <Text key={i} style={{ marginTop: 4 }}>
                • {s.crypto}: ${s.amount.toFixed(2)} on{" "}
                {new Date(s.timestamp).toLocaleString()}
              </Text>
            ))
        )}
      </Card>

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
