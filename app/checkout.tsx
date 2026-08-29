import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useStripe } from "@/stripe/StripeProvider";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createPaymentIntent } from "@/firebase/payments";
import { createOrder } from "@/firebase/orders";
import { Button } from "@/components/Button";
import { AddressForm, isAddressComplete } from "@/components/AddressForm";
import { colors, spacing } from "@/theme/colors";
import { formatMoney } from "@/utils/format";
import type { Address } from "@/types";

export default function CheckoutScreen() {
  const { lines, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const currency = lines[0]?.product.currency ?? process.env.EXPO_PUBLIC_CURRENCY ?? "inr";

  const [address, setAddress] = useState<Address>({
    line1: profile?.address?.line1 ?? "",
    line2: profile?.address?.line2 ?? "",
    city: profile?.address?.city ?? "",
    state: profile?.address?.state ?? "",
    postalCode: profile?.address?.postalCode ?? "",
    country: profile?.address?.country ?? "India",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof Address, value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));

  const handlePay = async () => {
    if (!user || !profile) return;
    if (!isAddressComplete(address)) {
      setError("Please fill in your full shipping address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { clientSecret, paymentIntentId } = await createPaymentIntent(total, currency);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Lippeen Art",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: profile.name, email: profile.email },
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== "Canceled") {
          setError(presentError.message);
        }
        return;
      }

      const orderId = await createOrder({
        userId: user.uid,
        userName: profile.name,
        userEmail: profile.email,
        lines,
        currency,
        shippingAddress: address,
        paymentIntentId,
      });

      clearCart();
      router.replace(`/order/${orderId}`);
    } catch (err: any) {
      setError(err?.message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Shipping address</Text>
      <AddressForm address={address} onChange={updateField} />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total to pay</Text>
        <Text style={styles.summaryValue}>{formatMoney(total, currency)}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Pay Now" onPress={handlePay} loading={loading} disabled={lines.length === 0} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
