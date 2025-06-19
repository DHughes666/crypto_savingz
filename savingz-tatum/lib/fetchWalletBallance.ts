import axios from "axios";

export async function fetchBnbChartData(timeframe: "1" | "7" | "30") {
  const response = await axios.get(
    "https://api.coingecko.com/api/v3/coins/binancecoin/market_chart",
    {
      params: {
        vs_currency: "ngn",
        days: timeframe,
        interval: timeframe === "1" ? "hourly" : "daily",
      },
    }
  );

  const history: number[] =
    response.data?.prices?.map(([, price]: [number, number]) => price) || [];
  return history;
}
