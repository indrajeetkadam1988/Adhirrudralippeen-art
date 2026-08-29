import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/colors";
import { formatMoney } from "@/utils/format";
import type { Product } from "@/types";

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: product.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <Text style={styles.motif}>{product.motif}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>{formatMoney(product.price, product.currency)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  body: {
    padding: spacing.sm + 2,
  },
  motif: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: 2,
    minHeight: 36,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
