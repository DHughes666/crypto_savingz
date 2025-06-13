import React, { useEffect, useState } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import {
  Text,
  Button,
  ActivityIndicator,
  SegmentedButtons,
} from "react-native-paper";
import { useAuth } from "../context/AuthProvider";
import { auth } from "../lib/firebaseConfig";
import { router } from "expo-router";
import { getCoinsByCategory } from "../lib/coinGecko";
import GradientHeader from "../components/GradientHeader";
import CoinCard from "../components/CoinCard";

const categories = [
  { label: "All", id: "" },
  { label: "BNB", id: "binancecoin" },
  { label: "ETH", id: "ethereum-ecosystem" },
  { label: "Alpha", id: "binance-launchpad" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();

  const [coins, setCoins] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(4320); // Mock balance

  const fetchCoins = async (reset = false, newPage = 1) => {
    try {
      if (reset) {
        setLoadingCoins(true);
        setCoins([]);
      }

      const data = await getCoinsByCategory(selectedCategory, newPage);
      setCoins(reset ? data : [...coins, ...data]);

      if (reset) setPage(1);
    } catch (error: any) {
      console.warn("Error fetching coins:", error?.message || error);
      setCoins([]); // Clear stale data
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      fetchCoins(true);
    }
  }, [loading, user, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCoins(true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchCoins(false, nextPage);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f4f4f4" }}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <GradientHeader balance={balance} />

      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <SegmentedButtons
          value={selectedCategory}
          onValueChange={(val) => setSelectedCategory(val)}
          buttons={categories.map((cat) => ({
            label: cat.label,
            value: cat.id,
          }))}
        />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {loadingCoins ? (
          <ActivityIndicator
            size="large"
            style={{ marginVertical: 30 }}
            animating={true}
          />
        ) : coins.length > 0 ? (
          <>
            {coins.map((coin: any) => (
              <CoinCard
                key={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                image={coin.image}
                price={coin.current_price}
                ngnPrice={coin.ngn_price}
                change={coin.price_change_percentage_24h || 0}
              />
            ))}
            <Button onPress={loadMore} style={{ marginTop: 16 }}>
              Load More
            </Button>
          </>
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            No coins found in this category.
          </Text>
        )}

        <Button
          mode="outlined"
          style={{ marginTop: 40 }}
          onPress={async () => {
            await auth.signOut();
            router.replace("/login");
          }}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}
