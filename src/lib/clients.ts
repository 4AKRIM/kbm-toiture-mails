import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Client } from "@/types";

const COLLECTION = "clients";

export function subscribeClients(
  userId: string,
  callback: (clients: Client[]) => void
) {
  const q = query(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    orderBy("nom", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Client, "id">) }))
    );
  });
}

export async function createClient(
  userId: string,
  data: Omit<Client, "id" | "createdAt" | "updatedAt">
) {
  const now = Date.now();
  const ref = await addDoc(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    { ...data, createdAt: now, updatedAt: now }
  );
  return ref.id;
}

export async function updateClient(
  userId: string,
  clientId: string,
  data: Partial<Client>
) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, clientId);
  await updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function deleteClient(userId: string, clientId: string) {
  await deleteDoc(doc(getFirebaseDb(), "users", userId, COLLECTION, clientId));
}
