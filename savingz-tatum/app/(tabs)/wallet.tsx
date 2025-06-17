import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthProvider";
import { router } from "expo-router";
import WalletCard from "../../components/WalletCard";
import { getOrCreateWallet } from "../../lib/api";
import { Wallet } from "../../types/wallet";
import QRCode from "react-native-qrcode-svg";
import { fetchBnbBalanceAndValue } from "../../lib/fetchWalletBallance";

export default function WalletScreen() {
  const { user, loading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [balance, setBalance] = useState<{
    balanceBNB: string;
    balanceNGN: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      (async () => {
        try {
          const data = await getOrCreateWallet();
          setWallet(data);

          // 💰 Fetch balance and price
          const b = await fetchBnbBalanceAndValue(data.address);
          setBalance(b);
        } catch (err) {
          console.error("Failed to load wallet or balance:", err);
        } finally {
          setLoadingWallet(false);
        }
      })();
    }
  }, [loading, user]);

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

          {balance && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance:</Text>
              <Text style={styles.balanceText}>{balance.balanceBNB} BNB</Text>
              <Text style={styles.balanceText}>≈ ₦{balance.balanceNGN}</Text>
            </View>
          )}

          <Text style={styles.qrLabel}>Your Wallet QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={wallet.address} size={180} />
          </View>
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
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  balanceLabel: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
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
    marginBottom: 40,
  },
});
