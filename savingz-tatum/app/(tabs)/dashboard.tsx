import React, { useEffect, useState } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import { Text, Button, TextInput, ActivityIndicator } from "react-native-paper";
import { useAuth } from "../../context/AuthProvider";
import { auth } from "../../lib/firebaseConfig";
import { router } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCoinsByCategory, getCoinCategories } from "../../lib/coinGecko";
import GradientHeader from "../../components/GradientHeader";
import CoinCard from "../../components/CoinCard";
import { Coin } from "../../types/coin";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);

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
      setCoins([]);
    } finally {
      setLoadingCoins(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetched = await getCoinCategories();
      setCategories([{ label: "All", value: "" }, ...fetched]);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Only activate when the coin categories get updated
  // useEffect(() => {
  //   AsyncStorage.removeItem("cached_coin_categories");
  // }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (user) {
      fetchCoins(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, selectedCategory]);

  useEffect(() => {
    const total = coins.reduce(
      (acc, coin) => acc + (coin.saved_amount || 0),
      0
    );
    setBalance(total);
  }, [coins]);

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
      <TextInput
        mode="outlined"
        label="Search Categories"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginHorizontal: 16, marginBottom: 8 }}
      />

      <View style={{ marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 10 }}
        >
          {categories.length === 0 ? (
            <ActivityIndicator size="small" style={{ marginLeft: 10 }} />
          ) : (
            categories
              .filter((cat) =>
                cat.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((cat) => (
                <Button
                  key={cat.value}
                  mode={
                    selectedCategory === cat.value ? "contained" : "outlined"
                  }
                  onPress={() => setSelectedCategory(cat.value)}
                  style={{ marginRight: 8 }}
                  compact
                >
                  {cat.label}
                </Button>
              ))
          )}
        </ScrollView>
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
                ngnSaved={coin.saved_amount}
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
