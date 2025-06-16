import axios from "axios";
import { auth } from "./firebaseConfig";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || "http://localhost:3000";

export const getOrCreateWallet = async () => {
  const token = await auth.currentUser?.getIdToken();
  const res = await axios.post(
    `${API_URL}/api/wallets`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
