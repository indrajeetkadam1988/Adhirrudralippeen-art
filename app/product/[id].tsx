import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { fetchProduct } from "@/firebase/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button";
import { colors, radius, spacing } from "@/theme/colors";
import { formatMoney } from "@/utils/format";
import type { Product } from "@/types";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProduct(id).then((p) => {
      setProduct(p);
      setSize(p?.sizeOptions[0] ?? "");
      setColor(p?.colorOptions[0] ?? "");
    });
  }, [id]);

  if (product === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (product === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>This piece is no longer available.</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    addToCart(product, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.motif}>{product.motif}</Text>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatMoney(product.price, product.currency)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.sizeOptions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Size</Text>
            <View style={styles.optionRow}>
              {product.sizeOptions.map((opt) => (
                <OptionChip key={opt} label={opt} selected={opt === size} onPress={() => setSize(opt)} />
              ))}
            </View>
          </>
        )}

        {product.colorOptions.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Base color</Text>
            <View style={styles.optionRow}>
              {product.colorOptions.map((opt) => (
                <OptionChip key={opt} label={opt} selected={opt === color} onPress={() => setColor(opt)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.stock}>
          {product.stock > 0 ? `${product.stock} in stock` : "Made to order"}
        </Text>

        <Button
          title={added ? "Added to Cart ✓" : "Add to Cart"}
          onPress={handleAddToCart}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </ScrollView>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {label}
    </Text>
  );
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
    fontSize: 15,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.border,
  },
  body: {
    padding: spacing.lg,
  },
  motif: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xs,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    fontSize: 13,
    color: colors.text,
    overflow: "hidden",
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
    color: colors.primary,
    fontWeight: "700",
  },
  stock: {
    marginTop: spacing.lg,
    fontSize: 12,
    color: colors.textMuted,
  },
});
