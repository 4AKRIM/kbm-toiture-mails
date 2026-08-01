import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Chantier } from "@/types";

const COLLECTION = "chantiers";

export function subscribeChantiers(
  userId: string,
  callback: (chantiers: Chantier[]) => void
) {
  const q = query(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    orderBy("dateDebut", "asc")
  );
  return onSnapshot(q, (snap) => {
    const items: Chantier[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Chantier, "id">),
    }));
    callback(items);
  });
}

export async function createChantier(
  userId: string,
  data: Omit<Chantier, "id" | "createdAt" | "updatedAt">
) {
  const now = Date.now();
  const ref = await addDoc(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    { ...data, createdAt: now, updatedAt: now }
  );
  return ref.id;
}

export async function updateChantier(
  userId: string,
  chantierId: string,
  data: Partial<Chantier>
) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, chantierId);
  await updateDoc(ref, { ...data, updatedAt: Date.now() });
}

export async function deleteChantier(userId: string, chantierId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, chantierId);
  await deleteDoc(ref);
}

export async function deplacerChantier(
  userId: string,
  chantierId: string,
  nouvelleDate: number
) {
  await updateChantier(userId, chantierId, { dateDebut: nouvelleDate });
}

// Utilitaire — conversion Firestore Timestamp <-> number, gardé ici pour
// centraliser un éventuel changement futur de format de stockage des dates.
export function tsToMillis(ts: Timestamp | number): number {
  return typeof ts === "number" ? ts : ts.toMillis();
}
