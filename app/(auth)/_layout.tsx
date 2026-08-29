import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { user, initializing } = useAuth();

  if (!initializing && user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShadowVisible: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "Create Account" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Reset Password" }} />
    </Stack>
  );
}
