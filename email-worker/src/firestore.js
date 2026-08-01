import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function initFirebase() {
  if (getApps().length) return;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON manquant dans les variables d'environnement.");
  const serviceAccount = JSON.parse(raw);
  initializeApp({ credential: cert(serviceAccount) });
}

initFirebase();
const db = getFirestore();

const userId = process.env.KBM_USER_ID;
if (!userId) throw new Error("KBM_USER_ID manquant dans les variables d'environnement.");

const emailsCol = db.collection("users").doc(userId).collection("emails");
const syncStateDoc = db.collection("users").doc(userId).collection("parametres").doc("syncEmails");

export async function mailDejaConnu(messageId) {
  const snap = await emailsCol.where("messageId", "==", messageId).limit(1).get();
  return !snap.empty;
}

export async function enregistrerMail(mail) {
  await emailsCol.add({ ...mail, createdAt: Date.now() });
}

export async function getDerniereSynchro() {
  const snap = await syncStateDoc.get();
  if (!snap.exists) return null;
  const data = snap.data();
  return data?.derniereSynchro ?? null;
}

export async function setDerniereSynchro(dateMs) {
  await syncStateDoc.set({ derniereSynchro: dateMs }, { merge: true });
}

export async function getMailsAEnvoyer() {
  const snap = await emailsCol.where("statut", "==", "a_envoyer").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function marquerMailEnvoye(mailId) {
  await emailsCol.doc(mailId).update({ statut: "envoye", envoyeLe: Date.now() });
}

export async function marquerMailEnErreur(mailId, erreur) {
  await emailsCol.doc(mailId).update({ statut: "a_valider", derniereErreurEnvoi: String(erreur) });
}

export { Timestamp };
