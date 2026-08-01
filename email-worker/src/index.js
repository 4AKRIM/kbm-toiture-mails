import { recupererNouveauxMails } from "./imap.js";
import { analyserMail } from "./ai.js";
import {
  mailDejaConnu,
  enregistrerMail,
  getDerniereSynchro,
  setDerniereSynchro,
  getMailsAEnvoyer,
  marquerMailEnvoye,
  marquerMailEnErreur,
} from "./firestore.js";
import { envoyerReponse } from "./send.js";

async function synchroniserMails() {
  console.log("→ Relève des nouveaux mails...");
  const derniereSynchro = await getDerniereSynchro();
  const mails = await recupererNouveauxMails(derniereSynchro);
  console.log(`  ${mails.length} mail(s) trouvé(s) depuis la dernière synchro.`);

  let nouveaux = 0;
  for (const mail of mails) {
    const connu = await mailDejaConnu(mail.messageId);
    if (connu) continue;

    console.log(`  Analyse IA : "${mail.sujet}"`);
    try {
      const analyse = await analyserMail(mail);

      await enregistrerMail({
        messageId: mail.messageId,
        de: mail.de,
        nomExpediteur: mail.nomExpediteur,
        sujet: mail.sujet,
        extrait: mail.texte.slice(0, 2000),
        dateReception: mail.dateReception,
        piecesJointes: mail.piecesJointes,
        statut: "a_valider",
        ...analyse,
      });
      nouveaux++;
    } catch (err) {
      // On ne bloque pas toute la synchro pour un seul mail en erreur :
      // il sera simplement retenté au prochain passage (dans 10 min).
      console.error(`  ✗ Échec de l'analyse pour "${mail.sujet}" :`, err.message);
    }

    // Petite pause pour rester sous la limite de requêtes/minute du compte gratuit.
    await new Promise((r) => setTimeout(r, 4000));
  }

  await setDerniereSynchro(Date.now());
  console.log(`  ${nouveaux} nouveau(x) mail(s) enregistré(s) dans l'application.`);
}

async function envoyerReponsesValidees() {
  console.log("→ Envoi des réponses validées...");
  const mails = await getMailsAEnvoyer();
  console.log(`  ${mails.length} réponse(s) en attente d'envoi.`);

  for (const mail of mails) {
    try {
      await envoyerReponse({
        destinataire: mail.de,
        sujet: mail.sujet,
        corps: mail.reponseModifiee || mail.reponseSuggeree,
      });
      await marquerMailEnvoye(mail.id);
      console.log(`  ✓ Réponse envoyée à ${mail.de}`);
    } catch (err) {
      console.error(`  ✗ Échec d'envoi à ${mail.de} :`, err.message);
      await marquerMailEnErreur(mail.id, err.message);
    }
  }
}

async function main() {
  await synchroniserMails();
  await envoyerReponsesValidees();
  console.log("Terminé.");
}

main().catch((err) => {
  console.error("Erreur fatale :", err);
  process.exit(1);
});