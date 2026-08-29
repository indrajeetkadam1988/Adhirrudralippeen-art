import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";
import type { Product } from "@/types";

const productsRef = collection(db, "products");

export function subscribeActiveProducts(onData: (products: Product[]) => void) {
  const q = query(productsRef, where("active", "==", true), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
  });
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function fetchAllProductsOnce(): Promise<Product[]> {
  const snap = await getDocs(query(productsRef, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}
