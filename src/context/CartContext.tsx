import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartLine, Product } from "@/types";

const CART_STORAGE_KEY = "lippeen-art-cart-v1";

interface CartContextValue {
  lines: CartLine[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeLine: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((raw) => {
        if (raw) setLines(JSON.parse(raw));
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines)).catch(() => {});
  }, [lines, hydrated]);

  const addToCart: CartContextValue["addToCart"] = (product, size, color, quantity = 1) => {
    setLines((prev) => {
      const existingIndex = prev.findIndex(
        (line) => line.product.id === product.id && line.size === size && line.color === color
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, size, color, quantity }];
    });
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, quantity: Math.max(1, quantity) } : line))
    );
  };

  const clearCart = () => setLines([]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [lines]
  );

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  return (
    <CartContext.Provider
      value={{ lines, addToCart, removeLine, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
