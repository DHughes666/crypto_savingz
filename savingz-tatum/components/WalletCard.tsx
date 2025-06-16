import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import * as Clipboard from "expo-clipboard";

type Props = {
  address: string;
  currency: string;
};

export default function WalletCard({ address, currency }: Props) {
  return (
    <Card style={styles.card}>
      <Card.Title title={`${currency} Wallet`} />
      <Card.Content>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.address}>{address}</Text>
        <Button
          onPress={() => Clipboard.setStringAsync(address)}
          mode="outlined"
          style={{ marginTop: 10 }}
        >
          Copy Address
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  address: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 4,
  },
});
