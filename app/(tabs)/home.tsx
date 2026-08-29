import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { subscribeActiveProducts } from "@/firebase/products";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { colors, spacing } from "@/theme/colors";
import type { Product } from "@/types";

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeActiveProducts(setProducts);
    return unsubscribe;
  }, []);

  if (products === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Lippeen Art</Text>
            <Text style={styles.subtitle}>
              Ready-made mirror &amp; mud relief wall art, handcrafted in the Kutch tradition.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No pieces available right now"
            subtitle="Check back soon, or request a custom piece from the Custom tab."
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
      />
    </View>
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
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
