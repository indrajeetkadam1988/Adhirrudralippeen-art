export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  address?: Address;
  createdAt: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  motif: string; // e.g. Peacock, Tree of Life, Elephant, Floral
  price: number; // in the smallest currency unit's major unit (e.g. rupees)
  currency: string; // e.g. "inr"
  images: string[];
  sizeOptions: string[]; // e.g. ["10x10 in", "16x16 in", "24x24 in"]
  colorOptions: string[]; // e.g. ["Terracotta", "White", "Antique Gold"]
  stock: number;
  isReadyMade: boolean;
  active: boolean;
  createdAt: number;
}

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  shippingAddress: Address;
  status: OrderStatus;
  paymentIntentId?: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type CustomRequestStatus =
  | "submitted"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "declined";

export interface CustomRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  motif: string;
  size: string;
  colorPreference: string;
  budget?: number;
  description: string;
  referenceImages: string[];
  status: CustomRequestStatus;
  quotedPrice?: number;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CartLine {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}
