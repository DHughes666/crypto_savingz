import React, { useState } from "react";
import { View, Alert } from "react-native";
import { TextInput, Button, Text, Menu } from "react-native-paper";
import { auth } from "../firebase/config";
import axios from "axios";
import Constants from "expo-constants";

export default function AddSavingScreen({ navigation }: any) {
  const { API_URL } = Constants.expoConfig?.extra || {};
  const [amount, setAmount] = useState("");
  const [crypto, setCrypto] = useState("BTC");
  const cryptoOptions = [
    "BTC",
    "ETH",
    "USDT",
    "SOL",
    "BNB",
    "XRP",
    "PUMPAI",
    "HMSTR",
  ];
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      await axios.post(
        `${API_URL}/api/user/save`,
        { amount: parseFloat(amount), crypto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Saving added!");
      navigation.navigate("Dashboard", { refresh: true });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Add New Saving
      </Text>

      <TextInput
        label="Amount (USD)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ marginBottom: 16 }}
      />

      <View style={{ marginBottom: 16 }}>
        <Button
          mode="outlined"
          onPress={() => setMenuVisible(true)}
          style={{ justifyContent: "flex-start" }}
        >
          {crypto || "Select Crypto"}
        </Button>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
        >
          {cryptoOptions.map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setCrypto(option);
                setMenuVisible(false);
              }}
              title={option}
            />
          ))}
        </Menu>
      </View>

      <Button mode="contained" loading={loading} onPress={handleSave}>
        Save
      </Button>
    </View>
  );
}
