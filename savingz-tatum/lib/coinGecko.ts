import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CATEGORY_CACHE_KEY = "cached_coin_categories";

const COINGECKO_API =
  Constants.expoConfig?.extra?.COINGECKO_API ||
  "https://api.coingecko.com/api/v3";

export const getCoinsByCategory = async (category = "", page = 1) => {
  const params: any = {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: 20,
    page: page,
    price_change_percentage: "24h",
  };

  if (category) {
    params.category = category; // ✅ only add category if non-empty
  }

  const res = await axios.get(`${COINGECKO_API}/coins/markets`, { params });

  const coinIds = res.data.map((coin: any) => coin.id).join(",");

  const ngnPricesRes = await axios.get(`${COINGECKO_API}/simple/price`, {
    params: {
      ids: coinIds,
      vs_currencies: "ngn",
    },
  });

  return res.data.map((coin: any) => ({
    ...coin,
    ngn_price: ngnPricesRes.data[coin.id]?.ngn ?? 0,
    saved_amount: 37, // mock amount
  }));
};

export const getCoinCategories = async () => {
  const allowed = [
    "binance-smart-chain",
    "binance-alpha-spotlight",
    "base-ecosystem",
    "aptos-ecosystem",
    "arbitrum-ecosystem",
    "algorand-ecosystem",
    "airdropped-tokens-by-nft-projects",
    "bitcoin-ecosystem",
    "bitcoin-fork",
    "bitcoin-layer-2",
    "communication",
    "software",
    "solana-ecosystem",
    "solana-meme-coins",
    "energy",
    "entertainment",
    "eos-ecosystem",
    "erc20i",
    "erc-404",
    "ergo-ecosystem",
    "ethereum-classic-ecosystem",
    "ethereum-ecosystem",
    "ethereum-pos-iou",
    "ethereumpow-ecosystem",
    "dot-ecosystem",
  ];

  try {
    // Try reading from cache
    const cached = await AsyncStorage.getItem(CATEGORY_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/coins/categories/list"
    );

    const filtered = res.data
      .filter((cat: any) => allowed.includes(cat.category_id))
      .map((cat: any) => ({
        label: cat.name,
        value: cat.category_id,
      }));
    // Save to cache
    await AsyncStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(filtered));

    return filtered;
  } catch (err) {
    console.error("Failed to fetch or cache categories", err);
    return [];
  }
};
