// lib/coinGecko.ts
import axios from "axios";
import Constants from "expo-constants";

const COINGECKO_API =
  Constants.expoConfig?.extra?.COINGECKO_API ||
  "https://api.coingecko.com/api/v3";

export const getCoinsByCategory = async (category = "", page = 1) => {
  const res = await axios.get(`${COINGECKO_API}/coins/markets`, {
    params: {
      vs_currency: "usd",
      category: category || undefined,
      order: "market_cap_desc",
      per_page: 20,
      page: page,
      price_change_percentage: "24h",
    },
  });

  const ngnPricesRes = await axios.get(`${COINGECKO_API}/simple/price`, {
    params: {
      ids: res.data.map((coin: any) => coin.id).join(","),
      vs_currencies: "ngn",
    },
  });

  return res.data.map((coin: any) => ({
    ...coin,
    ngn_price: ngnPricesRes.data[coin.id]?.ngn ?? 0,
  }));
};
