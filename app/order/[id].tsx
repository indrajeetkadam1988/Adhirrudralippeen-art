import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { StatusBadge } from "@/components/OrderStatusBadge";
import { colors, radius, spacing } from "@/theme/colors";
import { formatDate, formatMoney } from "@/utils/format";
import type { Order } from "@/types";

const STEPS: Order["status"][] = ["confirmed", "in_progress", "shipped", "delivered"];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", id), (snap) => {
      setOrder(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null);
    });
    return unsubscribe;
  }, [id]);

  if (order === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (order === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Order not found.</Text>
      </View>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <StatusBadge status={order.status} />
      <Text style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
      <Text style={styles.date}>Placed {formatDate(order.createdAt)}</Text>

      {order.status !== "cancelled" && (
        <View style={styles.timeline}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.timelineStep}>
              <View
                style={[
                  styles.dot,
                  index <= currentStepIndex && { backgroundColor: colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.timelineLabel,
                  index <= currentStepIndex && { color: colors.text, fontWeight: "700" },
                ]}
              >
                {stepLabel(step)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemMeta}>
              {item.size} · {item.color} · Qty {item.quantity}
            </Text>
          </View>
          <Text style={styles.itemPrice}>
            {formatMoney(item.unitPrice * item.quantity, order.currency)}
          </Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total paid</Text>
        <Text style={styles.totalValue}>{formatMoney(order.subtotal, order.currency)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Shipping to</Text>
      <Text style={styles.address}>
        {order.shippingAddress.line1}
        {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
        {"\n"}
        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
        {order.shippingAddress.postalCode}
        {"\n"}
        {order.shippingAddress.country}
      </Text>
    </ScrollView>
  );
}

function stepLabel(step: Order["status"]) {
  switch (step) {
    case "confirmed":
      return "Confirmed";
    case "in_progress":
      return "In Progress";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    default:
      return step;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  notFound: {
    color: colors.textMuted,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  timelineLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  address: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
