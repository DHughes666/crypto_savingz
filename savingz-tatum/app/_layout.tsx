import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthProvider";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack />
        <Toast />
      </AuthProvider>
    </PaperProvider>
  );
}
