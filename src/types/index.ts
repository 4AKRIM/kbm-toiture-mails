// ---------------------------------------------------------------------------
// Types du domaine métier KBM Toiture
// ---------------------------------------------------------------------------

export type StatutChantier =
  | "a_confirmer"
  | "confirme"
  | "en_cours"
  | "termine"
  | "reporte";

export const STATUTS: { value: StatutChantier; label: string }[] = [
  { value: "a_confirmer", label: "À confirmer" },
  { value: "confirme", label: "Confirmé" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "reporte", label: "Reporté" },
];

export const STATUT_STYLES: Record<
  StatutChantier,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  a_confirmer: {
    label: "À confirmer",
    dot: "bg-warning-500",
    bg: "bg-warning-50 dark:bg-warning-500/10",
    text: "text-warning-600 dark:text-warning-500",
    border: "border-warning-500/30",
  },
  confirme: {
    label: "Confirmé",
    dot: "bg-info-500",
    bg: "bg-info-50 dark:bg-info-500/10",
    text: "text-info-600 dark:text-info-500",
    border: "border-info-500/30",
  },
  en_cours: {
    label: "En cours",
    dot: "bg-tuile-500",
    bg: "bg-tuile-50 dark:bg-tuile-500/10",
    text: "text-tuile-600 dark:text-tuile-400",
    border: "border-tuile-500/30",
  },
  termine: {
    label: "Terminé",
    dot: "bg-success-500",
    bg: "bg-success-50 dark:bg-success-500/10",
    text: "text-success-600 dark:text-success-500",
    border: "border-success-500/30",
  },
  reporte: {
    label: "Reporté",
    dot: "bg-danger-500",
    bg: "bg-danger-50 dark:bg-danger-500/10",
    text: "text-danger-600 dark:text-danger-500",
    border: "border-danger-500/30",
  },
};

export type TypeTravaux =
  | "renovation_toiture"
  | "demoussage"
  | "isolation"
  | "zinguerie"
  | "fuite_reparation"
  | "velux"
  | "charpente"
  | "autre";

export const TYPES_TRAVAUX: { value: TypeTravaux; label: string }[] = [
  { value: "renovation_toiture", label: "Rénovation de toiture" },
  { value: "demoussage", label: "Démoussage / traitement" },
  { value: "isolation", label: "Isolation" },
  { value: "zinguerie", label: "Zinguerie" },
  { value: "fuite_reparation", label: "Réparation de fuite" },
  { value: "velux", label: "Pose Velux" },
  { value: "charpente", label: "Charpente" },
  { value: "autre", label: "Autre" },
];

export interface Adresse {
  rue: string;
  ville: string;
  codePostal: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Client {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  adresse: Adresse;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PhotoChantier {
  id: string;
  url: string;
  path: string; // chemin Firebase Storage
  createdAt: number;
  legende?: string;
}

export interface DocumentChantier {
  id: string;
  nom: string;
  url: string;
  path: string;
  type: string; // devis, facture, photo aérienne...
  createdAt: number;
}

export interface Chantier {
  id: string;
  clientId: string;
  clientNom: string; // dénormalisé pour affichage rapide
  telephone: string;
  adresse: Adresse;
  typeTravaux: TypeTravaux;
  dureeEstimeeHeures: number;
  dateDebut: number; // timestamp (ms) du jour de RDV
  heureDebut: string; // "08:00"
  statut: StatutChantier;
  montant: number;
  notes?: string;
  photos: PhotoChantier[];
  documents: DocumentChantier[];
  createdAt: number;
  updatedAt: number;
}

export type NotificationType =
  | "chantier_demain"
  | "chantier_aujourdhui"
  | "modification_planning"
  | "chantier_reporte";

export interface AppNotification {
  id: string;
  type: NotificationType;
  chantierId: string;
  titre: string;
  message: string;
  lu: boolean;
  createdAt: number;
}

export interface ParametresUtilisateur {
  nomEntreprise: string;
  adresseDepart: Adresse | null;
  heureDebutJournee: string; // "08:00"
  heureFinJournee: string; // "18:00"
  dureeParDefautHeures: number;
  themeSombre: boolean;
}

export interface SuggestionCreneau {
  date: number;
  score: number; // 0-100, plus haut = meilleur
  raison: string;
  distanceKm?: number;
  jourLibre: boolean;
}

// ---------------------------------------------------------------------------
// Module "Mails intelligents"
// ---------------------------------------------------------------------------

export type CategorieMail =
  | "clients"
  | "prospects"
  | "demande_devis"
  | "devis_accepte"
  | "facture_fournisseur"
  | "commande_fournisseur"
  | "banque"
  | "assurance"
  | "administratif"
  | "spam"
  | "important"
  | "urgent"
  | "a_traiter"
  | "archives";

export const CATEGORIES_MAIL: { value: CategorieMail; label: string; couleur: string }[] = [
  { value: "urgent", label: "Urgent", couleur: "bg-danger-500" },
  { value: "a_traiter", label: "À traiter", couleur: "bg-warning-500" },
  { value: "demande_devis", label: "Demande de devis", couleur: "bg-tuile-500" },
  { value: "devis_accepte", label: "Devis accepté", couleur: "bg-success-500" },
  { value: "clients", label: "Clients", couleur: "bg-info-500" },
  { value: "prospects", label: "Prospects", couleur: "bg-info-400" },
  { value: "facture_fournisseur", label: "Facture fournisseur", couleur: "bg-ardoise-500" },
  { value: "commande_fournisseur", label: "Commande fournisseur", couleur: "bg-ardoise-400" },
  { value: "banque", label: "Banque", couleur: "bg-ardoise-600" },
  { value: "assurance", label: "Assurance", couleur: "bg-ardoise-600" },
  { value: "administratif", label: "Administratif", couleur: "bg-ardoise-400" },
  { value: "important", label: "Important", couleur: "bg-warning-600" },
  { value: "spam", label: "Spam", couleur: "bg-ardoise-300" },
  { value: "archives", label: "Archives", couleur: "bg-ardoise-300" },
];

export type StatutMail = "nouveau" | "a_valider" | "a_envoyer" | "envoye" | "ignore";

export interface InfosExtraites {
  nom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  montant?: number;
  reference?: string;
  chantier?: string;
  typeDemande?: string;
  dateMentionnee?: string;
}

export interface PieceJointeMail {
  nomFichier: string;
  type: string; // pdf, image, word, excel...
  tailleOctets: number;
}

export interface MailAnalyse {
  id: string;
  messageId: string; // identifiant IMAP unique, sert à éviter les doublons
  de: string;
  nomExpediteur: string;
  sujet: string;
  extrait: string; // aperçu texte brut du mail
  dateReception: number;

  categorie: CategorieMail;
  urgence: "faible" | "normale" | "haute";
  resume: string;
  infos: InfosExtraites;
  reponseSuggeree: string;
  necessiteReponse: boolean;
  piecesJointes: PieceJointeMail[];

  statut: StatutMail;
  reponseModifiee?: string; // si l'utilisateur a édité la suggestion avant validation
  envoyeLe?: number;

  createdAt: number;
}

