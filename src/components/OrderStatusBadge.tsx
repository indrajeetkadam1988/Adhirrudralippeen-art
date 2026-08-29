import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";
import type { CustomRequestStatus, OrderStatus } from "@/types";

const ORDER_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const REQUEST_LABELS: Record<CustomRequestStatus, string> = {
  submitted: "Submitted",
  quoted: "Quoted",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  declined: "Declined",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: colors.warning,
  submitted: colors.warning,
  confirmed: colors.primary,
  quoted: colors.primary,
  accepted: colors.primary,
  in_progress: colors.accent,
  shipped: colors.accent,
  delivered: colors.success,
  completed: colors.success,
  cancelled: colors.danger,
  declined: colors.danger,
};

export function StatusBadge({ status }: { status: OrderStatus | CustomRequestStatus }) {
  const label = ORDER_LABELS[status as OrderStatus] ?? REQUEST_LABELS[status as CustomRequestStatus] ?? status;
  const color = STATUS_COLORS[status] ?? colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
