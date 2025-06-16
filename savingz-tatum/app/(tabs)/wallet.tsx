import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthProvider";
import { router } from "expo-router";
import WalletCard from "../../components/WalletCard";
import { getOrCreateWallet } from "../../lib/api";
import { Wallet } from "../../types/wallet";

export default function WalletScreen() {
  const { user, loading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      (async () => {
        try {
          const data = await getOrCreateWallet();
          setWallet(data);
        } catch (err) {
          console.error("Failed to load wallet:", err);
        } finally {
          setLoadingWallet(false);
        }
      })();
    }
  }, [loading, user]);

  if (loadingWallet) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {wallet ? (
        <WalletCard address={wallet.address} currency={wallet.currency} />
      ) : (
        <Text style={{ marginTop: 40, textAlign: "center" }}>
          Wallet not found.
        </Text>
      )}
    </ScrollView>
  );
}
