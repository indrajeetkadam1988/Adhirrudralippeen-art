import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { colors, radius, spacing } from "@/theme/colors";
import { formatMoney } from "@/utils/format";

export default function CartScreen() {
  const { lines, removeLine, updateQuantity, total } = useCart();
  const currency = lines[0]?.product.currency ?? "inr";

  if (lines.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse the shop to add a piece, or request a custom design."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lines}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.line}>
            <Image source={{ uri: item.product.images[0] }} style={styles.image} />
            <View style={styles.lineBody}>
              <Text style={styles.title} numberOfLines={2}>
                {item.product.title}
              </Text>
              <Text style={styles.meta}>
                {item.size} · {item.color}
              </Text>
              <Text style={styles.price}>
                {formatMoney(item.product.price * item.quantity, item.product.currency)}
              </Text>
              <View style={styles.qtyRow}>
                <QtyButton label="-" onPress={() => updateQuantity(index, item.quantity - 1)} />
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <QtyButton label="+" onPress={() => updateQuantity(index, item.quantity + 1)} />
                <Text style={styles.remove} onPress={() => removeLine(index)}>
                  Remove
                </Text>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatMoney(total, currency)}</Text>
        </View>
        <Button title="Checkout" onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}

function QtyButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text style={styles.qtyButton} onPress={onPress}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  line: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  lineBody: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  qtyButton: {
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontWeight: "700",
    overflow: "hidden",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    minWidth: 18,
    textAlign: "center",
  },
  remove: {
    marginLeft: "auto",
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
});
