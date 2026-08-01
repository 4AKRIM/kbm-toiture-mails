import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

/**
 * Se connecte à Gmail et récupère les mails reçus depuis `depuis` (Date).
 * Si `depuis` est null, ne récupère que les 20 derniers mails (première synchro).
 */
export async function recupererNouveauxMails(depuis) {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    logger: false,
  });

  await client.connect();
  const mails = [];

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      let criteres;
      if (depuis) {
        criteres = { since: new Date(depuis) };
      } else {
        // Première synchro : on limite aux 20 derniers mails pour ne pas tout ré-analyser d'un coup.
        const total = client.mailbox.exists;
        const debut = Math.max(1, total - 19);
        criteres = `${debut}:${total}`;
      }

      for await (const message of client.fetch(criteres, {
        envelope: true,
        source: true,
        uid: true,
      })) {
        const parsed = await simpleParser(message.source);

        mails.push({
          messageId: parsed.messageId || `uid-${message.uid}`,
          de: parsed.from?.value?.[0]?.address ?? "inconnu",
          nomExpediteur: parsed.from?.value?.[0]?.name ?? parsed.from?.value?.[0]?.address ?? "Inconnu",
          sujet: parsed.subject ?? "(sans sujet)",
          texte: (parsed.text ?? "").slice(0, 6000), // on borne la taille envoyée à l'IA
          dateReception: parsed.date ? parsed.date.getTime() : Date.now(),
          piecesJointes: (parsed.attachments ?? []).map((a) => ({
            nomFichier: a.filename ?? "document",
            type: a.contentType ?? "inconnu",
            tailleOctets: a.size ?? 0,
          })),
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return mails;
}
