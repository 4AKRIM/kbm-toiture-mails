// Utilise l'API Gemini (Google AI Studio) — gratuite, sans carte bancaire, sans expiration.
// Node 20+ fournit fetch nativement, aucune dépendance supplémentaire n'est nécessaire.

const MODEL = "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const CATEGORIES = [
  "clients",
  "prospects",
  "demande_devis",
  "devis_accepte",
  "facture_fournisseur",
  "commande_fournisseur",
  "banque",
  "assurance",
  "administratif",
  "spam",
  "important",
  "urgent",
  "a_traiter",
  "archives",
];

const SYSTEM_PROMPT = `Tu es l'assistant email d'une entreprise de couverture/zinguerie (KBM Toiture).
Tu analyses un mail reçu et tu réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte autour, respectant exactement ce format :

{
  "categorie": "une valeur parmi ${CATEGORIES.join(", ")}",
  "urgence": "faible" | "normale" | "haute",
  "resume": "résumé en une phrase, en français, concret",
  "necessiteReponse": true ou false,
  "reponseSuggeree": "brouillon de réponse en français, poli, professionnel, adapté au métier du bâtiment (vide si necessiteReponse est false)",
  "infos": {
    "nom": "nom de la personne si mentionné, sinon omettre le champ",
    "telephone": "si mentionné",
    "email": "si différent de l'expéditeur",
    "adresse": "si mentionnée",
    "ville": "si mentionnée",
    "montant": nombre si un montant est mentionné (sans le symbole €),
    "reference": "numéro de facture/devis/commande si présent",
    "chantier": "description courte du chantier concerné si identifiable",
    "typeDemande": "type de demande en 2-3 mots (ex: devis toiture, réclamation, relance facture...)",
    "dateMentionnee": "date mentionnée dans le mail si présente"
  }
}

Ne mets dans "infos" que les champs réellement identifiables — omets les autres plutôt que de mettre une valeur vide ou inventée.
Sois concis. Ne rajoute jamais de texte avant ou après le JSON.`;

export async function analyserMail(mail) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant dans les variables d'environnement.");

  const contenuUtilisateur = `Expéditeur : ${mail.nomExpediteur} <${mail.de}>
Sujet : ${mail.sujet}
Pièces jointes : ${mail.piecesJointes.map((p) => p.nomFichier).join(", ") || "aucune"}

Contenu du mail :
${mail.texte || "(mail sans contenu texte, probablement au format HTML uniquement ou pièce jointe seule)"}`;

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: contenuUtilisateur }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Erreur API Gemini (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const texte = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const nettoye = texte.replace(/^```json\s*|```$/g, "").trim();
    const analyse = JSON.parse(nettoye);
    return {
      categorie: CATEGORIES.includes(analyse.categorie) ? analyse.categorie : "a_traiter",
      urgence: ["faible", "normale", "haute"].includes(analyse.urgence) ? analyse.urgence : "normale",
      resume: analyse.resume ?? "",
      necessiteReponse: Boolean(analyse.necessiteReponse),
      reponseSuggeree: analyse.reponseSuggeree ?? "",
      infos: analyse.infos ?? {},
    };
  } catch (err) {
    console.error("Réponse IA non parsable pour le mail:", mail.sujet, texte);
    return {
      categorie: "a_traiter",
      urgence: "normale",
      resume: "(analyse automatique indisponible pour ce mail)",
      necessiteReponse: false,
      reponseSuggeree: "",
      infos: {},
    };
  }
}
