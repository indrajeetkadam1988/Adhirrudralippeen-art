import "react-native-gesture-handler";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@/stripe/StripeProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={stripePublishableKey}
          merchantIdentifier="merchant.com.lippeenart.app"
        >
          <AuthProvider>
            <CartProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShadowVisible: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="product/[id]" options={{ title: "" }} />
                <Stack.Screen name="order/[id]" options={{ title: "Order Details" }} />
                <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
              </Stack>
            </CartProvider>
          </AuthProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
