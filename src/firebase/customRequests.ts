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
import type { CustomRequest, CustomRequestStatus } from "@/types";

const requestsRef = collection(db, "customRequests");

export async function submitCustomRequest(params: {
  userId: string;
  userName: string;
  userEmail: string;
  motif: string;
  size: string;
  colorPreference: string;
  budget?: number;
  description: string;
  referenceImages: string[];
}) {
  const docRef = await addDoc(requestsRef, {
    ...params,
    status: "submitted" as CustomRequestStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeMyCustomRequests(
  userId: string,
  onData: (requests: CustomRequest[]) => void
) {
  const q = query(requestsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CustomRequest));
  });
}

export function subscribeAllCustomRequests(onData: (requests: CustomRequest[]) => void) {
  const q = query(requestsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CustomRequest));
  });
}

export async function updateCustomRequest(
  requestId: string,
  changes: Partial<Pick<CustomRequest, "status" | "quotedPrice" | "adminNotes">>
) {
  await updateDoc(doc(db, "customRequests", requestId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}
