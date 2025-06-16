import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text, Card, Badge } from "react-native-paper";

type Props = {
  name: string;
  symbol: string;
  image: string;
  price: number;
  ngnPrice: number;
  change: number;
  ngnSaved: number;
};

export default function CoinCard({
  name,
  symbol,
  image,
  price,
  ngnPrice,
  change,
  ngnSaved,
}: Props) {
  const isUp = change > 0;
  const badgeColor = change === 0 ? "#999" : isUp ? "green" : "red";

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Image source={{ uri: image }} style={styles.icon} />
        <View style={styles.info}>
          <Text variant="titleSmall">{symbol.toUpperCase()}</Text>
          <Text style={styles.price}>USD: ${price.toFixed(4)}</Text>
          <Text style={styles.price}>NGN: ₦{ngnPrice.toLocaleString()}</Text>
        </View>
        <View>
          <Text style={styles.saved}>
            ₦{ngnSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Badge style={[styles.badge, { backgroundColor: badgeColor }]}>
            {`${change.toFixed(2)}%`}
          </Badge>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 6,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  price: {
    fontSize: 12,
    color: "#555",
  },
  badge: {
    color: "white",
    fontSize: 12,
    paddingHorizontal: 8,
  },
  saved: {
    padding: 3,
    fontSize: 12,
  },
});
