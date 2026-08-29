import {
  addDoc,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Address, CartLine, Order, OrderStatus } from "@/types";

const ordersRef = collection(db, "orders");

export async function createOrder(params: {
  userId: string;
  userName: string;
  userEmail: string;
  lines: CartLine[];
  currency: string;
  shippingAddress: Address;
  paymentIntentId: string;
}) {
  const items = params.lines.map((line) => ({
    productId: line.product.id,
    title: line.product.title,
    image: line.product.images[0] ?? "",
    size: line.size,
    color: line.color,
    quantity: line.quantity,
    unitPrice: line.product.price,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const docRef = await addDoc(ordersRef, {
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    items,
    subtotal,
    currency: params.currency,
    shippingAddress: params.shippingAddress,
    status: "confirmed" as OrderStatus,
    paymentIntentId: params.paymentIntentId,
    paymentStatus: "paid",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeMyOrders(userId: string, onData: (orders: Order[]) => void) {
  const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
  });
}

export function subscribeAllOrders(onData: (orders: Order[]) => void) {
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}
