import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/auth/AuthProvider";
import Navigation from "./src/navigation";

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </PaperProvider>
  );
}
