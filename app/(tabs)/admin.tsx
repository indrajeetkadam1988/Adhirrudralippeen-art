import React, { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { subscribeAllOrders, updateOrderStatus } from "@/firebase/orders";
import { subscribeAllCustomRequests, updateCustomRequest } from "@/firebase/customRequests";
import { StatusBadge } from "@/components/OrderStatusBadge";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { colors, radius, spacing } from "@/theme/colors";
import { formatDate, formatMoney } from "@/utils/format";
import type { CustomRequest, CustomRequestStatus, Order, OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "confirmed",
  "in_progress",
  "shipped",
  "delivered",
  "cancelled",
];

const REQUEST_STATUSES: CustomRequestStatus[] = [
  "submitted",
  "quoted",
  "accepted",
  "in_progress",
  "completed",
  "declined",
];

export default function AdminScreen() {
  const [tab, setTab] = useState<"orders" | "requests">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);

  useEffect(() => {
    const unsubOrders = subscribeAllOrders(setOrders);
    const unsubRequests = subscribeAllCustomRequests(setRequests);
    return () => {
      unsubOrders();
      unsubRequests();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Text
          style={[styles.tabItem, tab === "orders" && styles.tabItemActive]}
          onPress={() => setTab("orders")}
        >
          Orders ({orders.length})
        </Text>
        <Text
          style={[styles.tabItem, tab === "requests" && styles.tabItemActive]}
          onPress={() => setTab("requests")}
        >
          Custom Requests ({requests.length})
        </Text>
      </View>

      {tab === "orders" ? (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No orders yet" />}
          renderItem={({ item }) => <AdminOrderCard order={item} />}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="No custom requests yet" />}
          renderItem={({ item }) => <AdminRequestCard request={item} />}
        />
      )}
    </View>
  );
}

function AdminOrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>#{order.id.slice(0, 8).toUpperCase()}</Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.cardMeta}>
        {order.userName} · {order.userEmail}
      </Text>
      <Text style={styles.cardMeta}>{formatDate(order.createdAt)}</Text>
      <Text style={styles.cardPrice}>{formatMoney(order.subtotal, order.currency)}</Text>

      {order.items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <Text style={styles.itemText} numberOfLines={1}>
            {item.title} · {item.size} · {item.color} · x{item.quantity}
          </Text>
        </View>
      ))}

      <Text style={styles.address}>
        {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
        {order.shippingAddress.postalCode}
      </Text>

      <View style={styles.statusRow}>
        {ORDER_STATUSES.map((status) => (
          <Text
            key={status}
            onPress={() => updateOrderStatus(order.id, status)}
            style={[styles.statusChip, order.status === status && styles.statusChipActive]}
          >
            {status.replace("_", " ")}
          </Text>
        ))}
      </View>
    </View>
  );
}

function AdminRequestCard({ request }: { request: CustomRequest }) {
  const [quote, setQuote] = useState(request.quotedPrice ? String(request.quotedPrice) : "");
  const [saving, setSaving] = useState(false);

  const sendQuote = async () => {
    if (!quote) return;
    setSaving(true);
    try {
      await updateCustomRequest(request.id, {
        quotedPrice: Number(quote),
        status: "quoted",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{request.motif}</Text>
        <StatusBadge status={request.status} />
      </View>
      <Text style={styles.cardMeta}>
        {request.userName} · {request.userEmail}
      </Text>
      <Text style={styles.cardMeta}>{formatDate(request.createdAt)}</Text>
      <Text style={styles.description}>
        Size: {request.size} · Color: {request.colorPreference || "—"}
        {request.budget ? ` · Budget ${formatMoney(request.budget)}` : ""}
      </Text>
      <Text style={styles.description}>{request.description}</Text>

      {request.referenceImages.length > 0 && (
        <ScrollView horizontal style={{ marginVertical: spacing.sm }}>
          {request.referenceImages.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.refImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.quoteRow}>
        <Input
          label="Quote price"
          value={quote}
          onChangeText={setQuote}
          keyboardType="number-pad"
          style={{ flex: 1 }}
        />
      </View>
      <Button title="Send Quote" onPress={sendQuote} loading={saving} variant="secondary" />

      <View style={styles.statusRow}>
        {REQUEST_STATUSES.map((status) => (
          <Text
            key={status}
            onPress={() => updateCustomRequest(request.id, { status })}
            style={[styles.statusChip, request.status === status && styles.statusChipActive]}
          >
            {status.replace("_", " ")}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1,
    textAlign: "center",
    paddingVertical: spacing.md,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabItemActive: {
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  itemImage: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  itemText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  address: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  refImage: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.border,
  },
  quoteRow: {
    marginTop: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    fontSize: 11,
    color: colors.textMuted,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  statusChipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
    color: colors.primary,
    fontWeight: "700",
  },
});
