import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

export default function GradientHeader({ balance }: { balance: number }) {
  return (
    <LinearGradient
      colors={["#d3cce3", "#e9e4f0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text variant="titleLarge" style={styles.greeting}>
        Welcome back 👋
      </Text>
      <Text variant="headlineMedium" style={styles.balance}>
        ${balance.toLocaleString()} Saved
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  greeting: {
    color: "#333",
    marginBottom: 6,
  },
  balance: {
    color: "#111",
    fontWeight: "bold",
  },
});
