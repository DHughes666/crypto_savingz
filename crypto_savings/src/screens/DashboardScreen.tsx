import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Modal, Text as RNText } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import ConfettiCannon from "react-native-confetti-cannon";
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
  const [showCelebration, setShowCelebration] = useState(false);
  const confettiRef = useRef<any>(null);

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
    if (userProfile?.level && userProfile.level > 1) {
      setShowCelebration(true);
    }
    fetchPrices();
    if (route?.params?.refresh) {
      refreshUserProfile(); // ✅ NEW
      navigation.setParams({ refresh: false });
    }
  }, [route?.params?.refresh, userProfile?.level]);

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

  const streak = userProfile.streakCount || 0;
  const lastSaved = savings.length
    ? new Date(Math.max(...savings.map((s) => new Date(s.timestamp).getTime())))
    : null;

  const getCelebrationEmoji = (days: number) => {
    if (days >= 30) return "🏆";
    if (days >= 7) return "🎊";
    if (days >= 3) return "🔥";
    return "👏";
  };

  const celebration = streak > 0 ? getCelebrationEmoji(streak) : null;

  const getMilestone = (amount: number) => {
    if (amount >= 5000) return { badge: "🏅", label: "Elite Saver" };
    if (amount >= 1000) return { badge: "🥇", label: "Gold Saver" };
    if (amount >= 500) return { badge: "🥈", label: "Silver Saver" };
    if (amount >= 100) return { badge: "🥉", label: "Bronze Saver" };
    return null;
  };

  const milestone = getMilestone(totalUsd);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 12 }}>
        Welcome {userProfile.firstName || `User_${userProfile.id}`}
      </Text>

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <Text variant="titleMedium">🎮 Gamified Rewards</Text>
        <Text>Level: {userProfile.level ?? 0}</Text>
        <Text>XP: {userProfile.xp ?? 0}</Text>

        {/* Progress Bar */}
        <View style={{ height: 10, backgroundColor: "#ccc", marginTop: 8 }}>
          <View
            style={{
              height: "100%",
              width: `${((userProfile.xp % 100) / 100) * 100}%`,
              backgroundColor: "#6200ee",
            }}
          />
        </View>
        <Text style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          {100 - (userProfile.xp % 100)} XP to next level
        </Text>
      </Card>

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

      {streak > 0 && (
        <Card
          style={{ marginBottom: 16, padding: 16, backgroundColor: "#e8f5e9" }}
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

      {milestone && (
        <Card
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: "#fff3e0",
          }}
        >
          <Text variant="titleMedium">
            {milestone.badge} {milestone.label}
          </Text>
          <Text style={{ color: "#6d4c41", marginTop: 4 }}>
            You've saved over ${Math.floor(totalUsd)} — keep up the great work!
          </Text>
        </Card>
      )}

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
      <Modal
        visible={showCelebration}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCelebration(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card style={{ padding: 24 }}>
            <Text variant="titleLarge" style={{ textAlign: "center" }}>
              🎉 Level Up!
            </Text>
            <Text style={{ textAlign: "center", marginVertical: 12 }}>
              You reached level {userProfile.level}! Keep saving!
            </Text>
            <Button onPress={() => setShowCelebration(false)}>Awesome!</Button>
          </Card>
          <ConfettiCannon count={150} origin={{ x: 200, y: -20 }} autoStart />
        </View>
      </Modal>
    </ScrollView>
  );
}
