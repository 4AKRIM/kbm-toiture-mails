import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  limit as fsLimit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { AppNotification, NotificationType } from "@/types";

const COLLECTION = "notifications";

export function subscribeNotifications(
  userId: string,
  callback: (items: AppNotification[]) => void
) {
  const q = query(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    orderBy("createdAt", "desc"),
    fsLimit(30)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AppNotification, "id">),
      }))
    );
  });
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  chantierId: string,
  titre: string,
  message: string
) {
  await addDoc(collection(getFirebaseDb(), "users", userId, COLLECTION), {
    type,
    chantierId,
    titre,
    message,
    lu: false,
    createdAt: Date.now(),
  });
}

export async function marquerNotificationLue(
  userId: string,
  notificationId: string
) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, notificationId);
  await updateDoc(ref, { lu: true });
}
