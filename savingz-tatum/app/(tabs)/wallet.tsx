import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthProvider";
import { router } from "expo-router";
import WalletCard from "../../components/WalletCard";
import QRCode from "react-native-qrcode-svg";
import { getOrCreateWallet } from "../../lib/api";
import { fetchBnbChartData } from "../../lib/fetchWalletBallance";
import BnbPriceChart from "../../components/BnbPriceChart";
import { Wallet } from "../../types/wallet";

const timeframes = ["1", "7", "30"] as const;

export default function WalletScreen() {
  const { user, loading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [prices, setPrices] = useState<number[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1" | "7" | "30">(
    "7"
  );
  const [loadingChart, setLoadingChart] = useState(false);

  const loadWallet = async () => {
    try {
      const data = await getOrCreateWallet();
      setWallet(data);
    } catch (err) {
      console.error("Failed to load wallet:", err);
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadChart = async (tf: "1" | "7" | "30") => {
    setLoadingChart(true);
    try {
      const data = await fetchBnbChartData(tf);
      setPrices(data);
    } catch (err) {
      console.error("Failed to load chart data:", err);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      loadWallet();
    }
  }, [loading, user]);

  useEffect(() => {
    loadChart(selectedTimeframe);
  }, [selectedTimeframe]);

  if (loadingWallet) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {wallet ? (
        <>
          <WalletCard address={wallet.address} currency={wallet.currency} />

          <Text style={styles.qrLabel}>Your Wallet QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={wallet.address} size={180} />
          </View>

          <Text style={styles.chartLabel}>BNB Price Trend (NGN)</Text>

          <View style={styles.toggleRow}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf}
                onPress={() => setSelectedTimeframe(tf)}
                style={[
                  styles.toggleButton,
                  tf === selectedTimeframe && styles.selectedButton,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    tf === selectedTimeframe && styles.selectedText,
                  ]}
                >
                  {tf === "1" ? "1D" : tf === "7" ? "7D" : "30D"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loadingChart ? (
            <ActivityIndicator animating size="small" />
          ) : (
            <BnbPriceChart prices={prices} />
          )}
        </>
      ) : (
        <Text style={{ marginTop: 40, textAlign: "center" }}>
          Wallet not found.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrLabel: {
    marginTop: 32,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  chartLabel: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  selectedButton: {
    backgroundColor: "#4caf50",
  },
  toggleText: {
    fontSize: 14,
    color: "#555",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },
});
