import React from "react";
import { Card, Text } from "react-native-paper";
import { View } from "react-native";

type Props = {
  name: string;
  usd: number;
  ngn: number;
  change24h: number;
};

export default function CryptoPriceCard({ name, usd, ngn, change24h }: Props) {
  const isUp = change24h >= 0;

  return (
    <Card style={{ marginVertical: 8, elevation: 2 }}>
      <Card.Content>
        <Text variant="titleMedium">{name}</Text>
        <View style={{ marginTop: 5 }}>
          <Text>USD: ${usd.toFixed(2)}</Text>
          <Text>NGN: ₦{ngn.toLocaleString()}</Text>
          <Text style={{ color: isUp ? "green" : "red" }}>
            24h Change: {change24h.toFixed(2)}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
