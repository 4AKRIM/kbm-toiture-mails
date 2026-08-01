"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { ParametresUtilisateur } from "@/types";
import { Loader2, Save } from "lucide-react";

const DEFAUT: ParametresUtilisateur = {
  nomEntreprise: "KBM Toiture",
  adresseDepart: null,
  heureDebutJournee: "08:00",
  heureFinJournee: "18:00",
  dureeParDefautHeures: 4,
  themeSombre: false,
};

export default function ParametresPage() {
  const { user } = useAuth();
  const [params, setParams] = useState<ParametresUtilisateur>(DEFAUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const ref = doc(getFirebaseDb(), "users", user.uid, "parametres", "general");
      const snap = await getDoc(ref);
      if (snap.exists()) setParams({ ...DEFAUT, ...(snap.data() as ParametresUtilisateur) });
      setLoading(false);
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(getFirebaseDb(), "users", user.uid, "parametres", "general");
      await setDoc(ref, params, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-tuile-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
        Paramètres
      </h1>

      <div className="space-y-5 rounded-2xl border border-ardoise-200 bg-white p-5 shadow-card dark:border-ardoise-800 dark:bg-ardoise-900">
        <Field label="Nom de l'entreprise">
          <input
            value={params.nomEntreprise}
            onChange={(e) => setParams((p) => ({ ...p, nomEntreprise: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Début de journée">
            <input
              type="time"
              value={params.heureDebutJournee}
              onChange={(e) => setParams((p) => ({ ...p, heureDebutJournee: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Fin de journée">
            <input
              type="time"
              value={params.heureFinJournee}
              onChange={(e) => setParams((p) => ({ ...p, heureFinJournee: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Durée par défaut d'un chantier (heures)">
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={params.dureeParDefautHeures}
            onChange={(e) =>
              setParams((p) => ({ ...p, dureeParDefautHeures: parseFloat(e.target.value) || 0 }))
            }
            className={inputClass}
          />
        </Field>

        <Field label="Adresse de départ (dépôt / atelier)">
          <input
            value={params.adresseDepart?.rue ?? ""}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                adresseDepart: {
                  rue: e.target.value,
                  ville: p.adresseDepart?.ville ?? "",
                  codePostal: p.adresseDepart?.codePostal ?? "",
                },
              }))
            }
            placeholder="Utilisée pour le calcul des trajets"
            className={inputClass}
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-tuile-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-tuile-600 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ardoise-500 dark:text-ardoise-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-sm text-ardoise-900 outline-none transition-colors focus:border-tuile-500 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-white";
