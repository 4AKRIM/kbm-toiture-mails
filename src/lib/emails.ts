import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  limit as fsLimit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { MailAnalyse, StatutMail } from "@/types";

const COLLECTION = "emails";

export function subscribeMails(
  userId: string,
  callback: (mails: MailAnalyse[]) => void,
  max = 200
) {
  const q = query(
    collection(getFirebaseDb(), "users", userId, COLLECTION),
    orderBy("dateReception", "desc"),
    fsLimit(max)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MailAnalyse, "id">) }))
    );
  });
}

export async function validerReponse(
  userId: string,
  mailId: string,
  reponseFinale: string
) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, mailId);
  // Le statut "a_envoyer" est repris par le robot GitHub Actions (email-worker)
  // qui envoie réellement le mail via SMTP puis repasse le statut à "envoye".
  await updateDoc(ref, {
    statut: "a_envoyer",
    reponseModifiee: reponseFinale,
  });
}

export async function ignorerMail(userId: string, mailId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, mailId);
  await updateDoc(ref, { statut: "ignore" satisfies StatutMail });
}

export async function remettreEnAttente(userId: string, mailId: string) {
  const ref = doc(getFirebaseDb(), "users", userId, COLLECTION, mailId);
  await updateDoc(ref, { statut: "a_valider" satisfies StatutMail });
}
