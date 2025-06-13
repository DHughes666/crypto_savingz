import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "@/context/AuthProvider";

export default function Layout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack />
      </AuthProvider>
    </PaperProvider>
  );
}
