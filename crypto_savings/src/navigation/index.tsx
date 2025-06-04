import React from "react";
import { Text } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../auth/LoginScreen";
import RegisterScreen from "../auth/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import { useAuth } from "../auth/AuthProvider";
import AddSavingScreen from "../screens/AddSavingsScreen";

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user } = useAuth();

  if (user === undefined) {
    return <Text>Loading...</Text>; // optional loader
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AddSaving" component={AddSavingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
