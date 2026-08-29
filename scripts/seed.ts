/**
 * Seeds the Firestore "products" collection with a starter Lippan-art catalog
 * and promotes one account to admin.
 *
 * Usage:
 *   1. Download a service account key from Firebase Console ->
 *      Project settings -> Service accounts -> Generate new private key.
 *   2. Save it as serviceAccountKey.json in the project root (already gitignored).
 *   3. Set ADMIN_EMAIL below (or via env var) to the account that should manage orders.
 *   4. npm run seed
 *
 * The image URLs below are neutral placeholders (placehold.co) - replace them
 * with real product photos (upload to Firebase Storage and paste the URLs here)
 * before shipping to the App Store / Play Store.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../serviceAccountKey.json";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

initializeApp({ credential: cert(serviceAccount as any) });
const db = getFirestore();

const CURRENCY = process.env.SEED_CURRENCY ?? "inr";

const products = [
  {
    title: "Peacock Mirror Wall Hanging",
    description:
      "Hand-relief mud work peacock centerpiece framed with hand-cut mirror chips, in the traditional Kutch Lippan style. Ready to hang.",
    motif: "Peacock",
    price: 2499,
    images: ["https://placehold.co/800x800/B4532A/F8F1E7?text=Peacock+Lippan+Art"],
    sizeOptions: ["12x12 in", "16x16 in", "20x20 in"],
    colorOptions: ["Terracotta", "Ivory White", "Antique Gold"],
    stock: 6,
  },
  {
    title: "Tree of Life Mirror Plate",
    description:
      "A circular Lippan plate depicting the Tree of Life, a symbol of prosperity, surrounded by intricate mirror-work borders.",
    motif: "Tree of Life",
    price: 3299,
    images: ["https://placehold.co/800x800/8A3D1E/F8F1E7?text=Tree+of+Life"],
    sizeOptions: ["14 in round", "18 in round"],
    colorOptions: ["Terracotta", "Ivory White"],
    stock: 4,
  },
  {
    title: "Elephant Caravan Wall Panel",
    description:
      "A row of Lippan-style elephants in relief, a classic Kutchi motif symbolizing good fortune, finished with fine mirror inlay.",
    motif: "Elephant",
    price: 4199,
    images: ["https://placehold.co/800x800/C9A227/2C231E?text=Elephant+Panel"],
    sizeOptions: ["24x10 in"],
    colorOptions: ["Terracotta", "Antique Gold"],
    stock: 3,
  },
  {
    title: "Floral Rangoli Mirror Plate",
    description:
      "A radiating floral mandala rendered in raised mud relief with dozens of hand-set mirror pieces, ideal for a festive wall.",
    motif: "Floral",
    price: 1899,
    images: ["https://placehold.co/800x800/B4532A/F8F1E7?text=Floral+Rangoli"],
    sizeOptions: ["10x10 in", "14x14 in"],
    colorOptions: ["Ivory White", "Antique Gold"],
    stock: 8,
  },
  {
    title: "Camel Caravan Wall Art",
    description:
      "Desert camel caravan in traditional Lippan relief, a nod to Kutch's Rann of Kutch landscape, mirror-bordered.",
    motif: "Camel Caravan",
    price: 3799,
    images: ["https://placehold.co/800x800/8A3D1E/F8F1E7?text=Camel+Caravan"],
    sizeOptions: ["22x12 in"],
    colorOptions: ["Terracotta"],
    stock: 2,
  },
  {
    title: "Geometric Mirror Mandala",
    description:
      "A modern take on Lippan Kaam using precise geometric relief patterns and symmetrical mirror clusters.",
    motif: "Geometric",
    price: 2199,
    images: ["https://placehold.co/800x800/C9A227/2C231E?text=Geometric+Mandala"],
    sizeOptions: ["12x12 in", "16x16 in"],
    colorOptions: ["Ivory White", "Terracotta", "Antique Gold"],
    stock: 5,
  },
];

async function seedProducts() {
  const batch = db.batch();
  for (const product of products) {
    const ref = db.collection("products").doc();
    batch.set(ref, {
      ...product,
      currency: CURRENCY,
      isReadyMade: true,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`Seeded ${products.length} products.`);
}

async function promoteAdmin() {
  if (!ADMIN_EMAIL) {
    console.log("No ADMIN_EMAIL set - skipping admin promotion. Set it and re-run to grant admin access.");
    return;
  }
  const userRecord = await getAuth().getUserByEmail(ADMIN_EMAIL);
  await db.collection("users").doc(userRecord.uid).set({ role: "admin" }, { merge: true });
  console.log(`Granted admin role to ${ADMIN_EMAIL}.`);
}

async function main() {
  await seedProducts();
  await promoteAdmin();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
