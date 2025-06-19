import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import VictoryChart from "victory-native/lib/components/victory-chart";
import VictoryLine from "victory-native/lib/components/victory-line";
import VictoryAxis from "victory-native/lib/components/victory-axis";

import axios from "axios";

type Timeframe = "1" | "7" | "30";

const TIMEFRAMES: Record<Timeframe, string> = {
  "1": "1D",
  "7": "7D",
  "30": "30D",
};

export default function BNBChartScreen() {
  const [prices, setPrices] = useState<{ x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("7");

  const fetchPrices = async (days: Timeframe) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days,
          },
        }
      );
      const priceData = res.data.prices.map(
        ([timestamp, price]: [number, number]) => ({
          x: timestamp,
          y: price,
        })
      );
      setPrices(priceData);
    } catch (err) {
      console.error("Failed to fetch price data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(selectedTimeframe);
  }, [selectedTimeframe]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        BNB Price Trend ({TIMEFRAMES[selectedTimeframe]})
      </Text>

      <View style={styles.toggleRow}>
        {Object.entries(TIMEFRAMES).map(([value, label]) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.toggleButton,
              selectedTimeframe === value && styles.activeButton,
            ]}
            onPress={() => setSelectedTimeframe(value as Timeframe)}
          >
            <Text
              style={
                selectedTimeframe === value
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <VictoryChart domainPadding={10}>
          <VictoryLine
            data={prices}
            style={{ data: { stroke: "#4b9be0", strokeWidth: 2 } }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              tickLabels: { fontSize: 10 },
            }}
          />
          <VictoryAxis
            tickFormat={(t) =>
              new Date(t).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
              })
            }
            style={{ tickLabels: { angle: -45, fontSize: 8 } }}
          />
        </VictoryChart>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeButton: {
    backgroundColor: "#4b9be0",
    borderColor: "#4b9be0",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#444",
  },
});
