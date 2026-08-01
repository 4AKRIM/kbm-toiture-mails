"use client";

import { useMemo, useState } from "react";
import { Search, Phone, MapPin, Plus, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/use-app-data";
import { createClient, updateClient, deleteClient } from "@/lib/clients";
import { initiales, formatDateCourte } from "@/lib/utils";
import type { Client, Chantier } from "@/types";

export default function ClientsPage() {
  const { user } = useAuth();
  const { clients, chantiers } = useAppData();
  const [recherche, setRecherche] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);

  const filtres = useMemo(() => {
    if (!recherche.trim()) return clients;
    const q = recherche.toLowerCase();
    return clients.filter(
      (c) => c.nom.toLowerCase().includes(q) || c.adresse.ville.toLowerCase().includes(q)
    );
  }, [clients, recherche]);

  const historique = selected
    ? chantiers.filter((c) => c.clientId === selected.id).sort((a, b) => b.dateDebut - a.dateDebut)
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
          Clients
        </h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-tuile-500 px-4 py-2.5 text-sm font-medium text-white shadow-premium hover:bg-tuile-600"
        >
          <Plus className="h-4 w-4" /> Ajouter un client
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-ardoise-200 bg-white px-3 py-2.5 dark:border-ardoise-700 dark:bg-ardoise-900">
        <Search className="h-4 w-4 text-ardoise-400" />
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par nom ou ville..."
          className="w-full bg-transparent text-sm text-ardoise-700 outline-none placeholder:text-ardoise-400 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtres.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className="flex items-start gap-3 rounded-2xl border border-ardoise-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ardoise-800 dark:bg-ardoise-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tuile-500/10 font-display text-sm font-semibold text-tuile-600">
              {initiales(c.nom)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ardoise-900 dark:text-white">
                {c.nom}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-ardoise-500 dark:text-ardoise-400">
                <MapPin className="h-3 w-3 shrink-0" /> {c.adresse.ville || "—"}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-ardoise-500 dark:text-ardoise-400">
                <Phone className="h-3 w-3 shrink-0" /> {c.telephone || "—"}
              </p>
            </div>
          </button>
        ))}
        {filtres.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-ardoise-400">
            Aucun client trouvé.
          </p>
        )}
      </div>

      {selected && (
        <ClientPanel
          client={selected}
          historique={historique}
          onClose={() => setSelected(null)}
          onSave={async (data) => {
            if (!user) return;
            await updateClient(user.uid, selected.id, data);
            setSelected(null);
          }}
          onDelete={async () => {
            if (!user) return;
            if (!confirm("Supprimer ce client ?")) return;
            await deleteClient(user.uid, selected.id);
            setSelected(null);
          }}
        />
      )}

      {creating && (
        <ClientPanel
          onClose={() => setCreating(false)}
          onSave={async (data) => {
            if (!user) return;
            await createClient(user.uid, data);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ClientPanel({
  client,
  historique = [],
  onClose,
  onSave,
  onDelete,
}: {
  client?: Client;
  historique?: Chantier[];
  onClose: () => void;
  onSave: (data: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const [nom, setNom] = useState(client?.nom ?? "");
  const [telephone, setTelephone] = useState(client?.telephone ?? "");
  const [rue, setRue] = useState(client?.adresse.rue ?? "");
  const [ville, setVille] = useState(client?.adresse.ville ?? "");
  const [codePostal, setCodePostal] = useState(client?.adresse.codePostal ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md animate-slide-in-right flex-col bg-white shadow-2xl dark:bg-ardoise-900">
        <div className="flex items-center justify-between border-b border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          <h2 className="font-display text-lg font-semibold text-ardoise-900 dark:text-white">
            {client ? client.nom : "Nouveau client"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ardoise-400 hover:bg-ardoise-100 dark:hover:bg-ardoise-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du client"
            className={inputClass}
          />
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone"
            className={inputClass}
          />
          <input
            value={rue}
            onChange={(e) => setRue(e.target.value)}
            placeholder="Rue"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={codePostal}
              onChange={(e) => setCodePostal(e.target.value)}
              placeholder="Code postal"
              className={inputClass}
            />
            <input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ville"
              className={inputClass}
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className={inputClass}
          />

          {historique.length > 0 && (
            <div className="pt-2">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ardoise-400">
                Historique des chantiers
              </h3>
              <div className="space-y-1.5">
                {historique.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-xl border border-ardoise-200 px-3 py-2 text-xs dark:border-ardoise-700"
                  >
                    <span className="text-ardoise-600 dark:text-ardoise-300">
                      {formatDateCourte(h.dateDebut)}
                    </span>
                    <span className="text-ardoise-400">{h.montant} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="rounded-xl px-3 py-2 text-sm font-medium text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
            >
              Supprimer
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={() =>
              onSave({
                nom: nom.trim(),
                telephone,
                adresse: {
                  rue,
                  ville,
                  codePostal,
                  lat: client?.adresse.lat ?? null,
                  lng: client?.adresse.lng ?? null,
                },
                notes,
              })
            }
            disabled={!nom.trim()}
            className="rounded-xl bg-tuile-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-tuile-600 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-sm text-ardoise-900 outline-none transition-colors focus:border-tuile-500 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-white";
