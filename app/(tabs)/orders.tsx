import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { subscribeMyOrders } from "@/firebase/orders";
import { subscribeMyCustomRequests } from "@/firebase/customRequests";
import { StatusBadge } from "@/components/OrderStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { colors, radius, spacing } from "@/theme/colors";
import { formatDate, formatMoney } from "@/utils/format";
import type { CustomRequest, Order } from "@/types";

type Row =
  | { kind: "order"; data: Order }
  | { kind: "request"; data: CustomRequest };

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubOrders = subscribeMyOrders(user.uid, setOrders);
    const unsubRequests = subscribeMyCustomRequests(user.uid, setRequests);
    return () => {
      unsubOrders();
      unsubRequests();
    };
  }, [user]);

  const rows: Row[] = [
    ...orders.map((o) => ({ kind: "order" as const, data: o })),
    ...requests.map((r) => ({ kind: "request" as const, data: r })),
  ].sort((a, b) => toMillis(b.data.createdAt) - toMillis(a.data.createdAt));

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(row) => `${row.kind}-${row.data.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No orders yet"
            subtitle="Orders you place, and custom requests you submit, will appear here."
          />
        }
        renderItem={({ item }) =>
          item.kind === "order" ? (
            <OrderRow order={item.data} />
          ) : (
            <RequestRow request={item.data} />
          )
        }
      />
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  const thumbnail = order.items[0]?.image;
  return (
    <View style={styles.card} onTouchEnd={() => router.push(`/order/${order.id}`)}>
      {thumbnail ? <Image source={{ uri: thumbnail }} style={styles.thumb} /> : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>
          Order · {order.items.length} item{order.items.length > 1 ? "s" : ""}
        </Text>
        <Text style={styles.cardMeta}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.cardPrice}>{formatMoney(order.subtotal, order.currency)}</Text>
        <StatusBadge status={order.status} />
      </View>
    </View>
  );
}

function RequestRow({ request }: { request: CustomRequest }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>Custom request · {request.motif}</Text>
        <Text style={styles.cardMeta}>{formatDate(request.createdAt)}</Text>
        {request.quotedPrice ? (
          <Text style={styles.cardPrice}>Quoted {formatMoney(request.quotedPrice)}</Text>
        ) : (
          <Text style={styles.cardMeta}>Awaiting quote from the artist</Text>
        )}
        <StatusBadge status={request.status} />
      </View>
    </View>
  );
}

function toMillis(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof (value as any).toMillis === "function") return (value as any).toMillis();
  return 0;
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
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
});
