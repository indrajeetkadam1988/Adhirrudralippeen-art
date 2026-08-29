import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe as useStripeJs,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createPaymentIntent } from "@/firebase/payments";
import { createOrder } from "@/firebase/orders";
import { Button } from "@/components/Button";
import { AddressForm, isAddressComplete } from "@/components/AddressForm";
import { colors, spacing } from "@/theme/colors";
import { formatMoney } from "@/utils/format";
import type { Address, CartLine } from "@/types";

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export default function CheckoutScreenWeb() {
  const { lines, total, clearCart } = useCart();
  const { profile } = useAuth();
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const updateField = (key: keyof Address, value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));

  const handleContinue = async () => {
    if (!isAddressComplete(address)) {
      setError("Please fill in your full shipping address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await createPaymentIntent(total, currency);
      setClientSecret(result.clientSecret);
      setPaymentIntentId(result.paymentIntentId);
    } catch (err: any) {
      setError(err?.message ?? "Couldn't start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (clientSecret && paymentIntentId) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentStep
          address={address}
          lines={lines}
          currency={currency}
          total={total}
          paymentIntentId={paymentIntentId}
          onSuccess={clearCart}
        />
      </Elements>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Shipping address</Text>
      <AddressForm address={address} onChange={updateField} />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total to pay</Text>
        <Text style={styles.summaryValue}>{formatMoney(total, currency)}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title="Continue to Payment"
        onPress={handleContinue}
        loading={loading}
        disabled={lines.length === 0}
      />
    </ScrollView>
  );
}

function PaymentStep({
  address,
  lines,
  currency,
  total,
  paymentIntentId,
  onSuccess,
}: {
  address: Address;
  lines: CartLine[];
  currency: string;
  total: number;
  paymentIntentId: string;
  onSuccess: () => void;
}) {
  const { user, profile } = useAuth();
  const stripe = useStripeJs();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements || !user || !profile) return;
    setError(null);
    setLoading(true);
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message ?? "Payment failed. Please try again.");
        return;
      }
      if (paymentIntent?.status !== "succeeded") {
        setError("Payment wasn't completed. Please try again.");
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

      onSuccess();
      router.replace(`/order/${orderId}`);
    } catch (err: any) {
      setError(err?.message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.sectionTitle}>Payment</Text>
      <View style={styles.elementWrap}>
        <PaymentElement />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total to pay</Text>
        <Text style={styles.summaryValue}>{formatMoney(total, currency)}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Pay Now" onPress={handlePay} loading={loading} disabled={!stripe} />
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
  elementWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: "visible",
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
