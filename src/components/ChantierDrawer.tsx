"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Sparkles,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileText,
  Loader2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  STATUTS,
  TYPES_TRAVAUX,
  type Chantier,
  type StatutChantier,
  type TypeTravaux,
  type Adresse,
} from "@/types";
import { createChantier, updateChantier, deleteChantier } from "@/lib/chantiers";
import { createClient } from "@/lib/clients";
import { createNotification } from "@/lib/notifications";
import { uploadPhotoChantier, uploadDocumentChantier } from "@/lib/storage";
import { geocoderAdresse } from "@/lib/geo";
import { suggererCreneaux } from "@/lib/suggest-slot";
import { cn, formatDateLongue, formatMontant } from "@/lib/utils";
import type { Client } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  chantier?: Chantier | null; // édition si présent
  chantiers: Chantier[]; // pour calcul des suggestions
  clients: Client[];
  dateInitiale?: number | null;
}

const emptyAdresse: Adresse = { rue: "", ville: "", codePostal: "", lat: null, lng: null };

export function ChantierDrawer({
  open,
  onClose,
  chantier,
  chantiers,
  clients,
  dateInitiale,
}: Props) {
  const { user } = useAuth();
  const isEdit = !!chantier;

  const [clientNom, setClientNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [clientIdSelectionne, setClientIdSelectionne] = useState<string | null>(null);
  const [adresse, setAdresse] = useState<Adresse>(emptyAdresse);
  const [typeTravaux, setTypeTravaux] = useState<TypeTravaux>("renovation_toiture");
  const [duree, setDuree] = useState(4);
  const [dateDebut, setDateDebut] = useState<number>(dateInitiale ?? Date.now());
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [statut, setStatut] = useState<StatutChantier>("a_confirmer");
  const [montant, setMontant] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Chantier["photos"]>([]);
  const [documents, setDocuments] = useState<Chantier["documents"]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (chantier) {
      setClientNom(chantier.clientNom);
      setTelephone(chantier.telephone);
      setClientIdSelectionne(chantier.clientId);
      setAdresse(chantier.adresse);
      setTypeTravaux(chantier.typeTravaux);
      setDuree(chantier.dureeEstimeeHeures);
      setDateDebut(chantier.dateDebut);
      setHeureDebut(chantier.heureDebut);
      setStatut(chantier.statut);
      setMontant(chantier.montant);
      setNotes(chantier.notes ?? "");
      setPhotos(chantier.photos ?? []);
      setDocuments(chantier.documents ?? []);
    } else {
      setClientNom("");
      setTelephone("");
      setClientIdSelectionne(null);
      setAdresse(emptyAdresse);
      setTypeTravaux("renovation_toiture");
      setDuree(4);
      setDateDebut(dateInitiale ?? Date.now());
      setHeureDebut("08:00");
      setStatut("a_confirmer");
      setMontant(0);
      setNotes("");
      setPhotos([]);
      setDocuments([]);
    }
    setShowSuggestions(false);
  }, [chantier, open, dateInitiale]);

  const suggestions = useMemo(() => {
    if (!adresse.lat || !adresse.lng) return [];
    return suggererCreneaux(
      chantiers.filter((c) => c.id !== chantier?.id),
      adresse,
      duree
    );
  }, [adresse, duree, chantiers, chantier?.id]);

  const clientsFiltres = useMemo(() => {
    if (!clientNom.trim()) return [];
    return clients
      .filter((c) => c.nom.toLowerCase().includes(clientNom.toLowerCase()))
      .slice(0, 5);
  }, [clientNom, clients]);

  function selectionnerClient(c: Client) {
    setClientIdSelectionne(c.id);
    setClientNom(c.nom);
    setTelephone(c.telephone);
    setAdresse(c.adresse);
  }

  async function handleGeocoder() {
    if (!adresse.rue || !adresse.ville) return;
    const coords = await geocoderAdresse(adresse);
    if (coords) setAdresse((a) => ({ ...a, ...coords }));
  }

  async function handlePhotoUpload(files: FileList | null) {
    if (!files || !user || !chantier) return;
    setUploadingPhoto(true);
    try {
      let updated = photos;
      for (const file of Array.from(files)) {
        const { url, path } = await uploadPhotoChantier(user.uid, chantier.id, file);
        const photo = { id: crypto.randomUUID(), url, path, createdAt: Date.now() };
        updated = [...updated, photo];
      }
      setPhotos(updated);
      await updateChantier(user.uid, chantier.id, { photos: updated });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDocUpload(files: FileList | null) {
    if (!files || !user || !chantier) return;
    setUploadingDoc(true);
    try {
      let updated = documents;
      for (const file of Array.from(files)) {
        const { url, path } = await uploadDocumentChantier(user.uid, chantier.id, file);
        const docItem = {
          id: crypto.randomUUID(),
          nom: file.name,
          url,
          path,
          type: "document",
          createdAt: Date.now(),
        };
        updated = [...updated, docItem];
      }
      setDocuments(updated);
      await updateChantier(user.uid, chantier.id, { documents: updated });
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      let finalClientId = clientIdSelectionne;
      if (!finalClientId && clientNom.trim()) {
        finalClientId = await createClient(user.uid, {
          nom: clientNom.trim(),
          telephone,
          adresse,
        });
      }

      const payload = {
        clientId: finalClientId ?? "",
        clientNom: clientNom.trim(),
        telephone,
        adresse,
        typeTravaux,
        dureeEstimeeHeures: duree,
        dateDebut,
        heureDebut,
        statut,
        montant,
        notes,
        photos,
        documents,
      };

      if (isEdit && chantier) {
        await updateChantier(user.uid, chantier.id, payload);

        if (statut === "reporte" && chantier.statut !== "reporte") {
          await createNotification(
            user.uid,
            "chantier_reporte",
            chantier.id,
            "Chantier reporté",
            `${clientNom} a été reporté`
          );
        } else if (dateDebut !== chantier.dateDebut || heureDebut !== chantier.heureDebut) {
          await createNotification(
            user.uid,
            "modification_planning",
            chantier.id,
            "Planning modifié",
            `${clientNom} déplacé au ${new Date(dateDebut).toLocaleDateString("fr-FR")}`
          );
        }
      } else {
        await createChantier(user.uid, payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !chantier) return;
    if (!confirm("Supprimer définitivement ce chantier ?")) return;
    await deleteChantier(user.uid, chantier.id);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-2xl dark:bg-ardoise-900">
        <div className="flex items-center justify-between border-b border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          <h2 className="font-display text-lg font-semibold text-ardoise-900 dark:text-white">
            {isEdit ? "Modifier le chantier" : "Nouveau chantier"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ardoise-400 hover:bg-ardoise-100 dark:hover:bg-ardoise-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Client */}
          <Section title="Client">
            <div className="relative">
              <Field label="Nom du client">
                <input
                  value={clientNom}
                  onChange={(e) => {
                    setClientNom(e.target.value);
                    setClientIdSelectionne(null);
                  }}
                  placeholder="M. et Mme Dupont"
                  className={inputClass}
                />
              </Field>
              {clientsFiltres.length > 0 && !clientIdSelectionne && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-ardoise-200 bg-white shadow-lg dark:border-ardoise-700 dark:bg-ardoise-800">
                  {clientsFiltres.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectionnerClient(c)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-ardoise-50 dark:hover:bg-ardoise-700"
                    >
                      {c.nom} <span className="text-ardoise-400">— {c.adresse.ville}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Field label="Téléphone">
              <input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                className={inputClass}
              />
            </Field>
          </Section>

          {/* Adresse */}
          <Section title="Adresse du chantier">
            <Field label="Rue">
              <input
                value={adresse.rue}
                onChange={(e) => setAdresse((a) => ({ ...a, rue: e.target.value }))}
                onBlur={handleGeocoder}
                placeholder="12 rue des Artisans"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code postal">
                <input
                  value={adresse.codePostal}
                  onChange={(e) => setAdresse((a) => ({ ...a, codePostal: e.target.value }))}
                  onBlur={handleGeocoder}
                  placeholder="33000"
                  className={inputClass}
                />
              </Field>
              <Field label="Ville">
                <input
                  value={adresse.ville}
                  onChange={(e) => setAdresse((a) => ({ ...a, ville: e.target.value }))}
                  onBlur={handleGeocoder}
                  placeholder="Bordeaux"
                  className={inputClass}
                />
              </Field>
            </div>
            {adresse.lat && (
              <p className="flex items-center gap-1 text-xs text-success-600">
                <MapPin className="h-3 w-3" /> Adresse localisée
              </p>
            )}
          </Section>

          {/* Travaux */}
          <Section title="Nature des travaux">
            <Field label="Type de travaux">
              <select
                value={typeTravaux}
                onChange={(e) => setTypeTravaux(e.target.value as TypeTravaux)}
                className={inputClass}
              >
                {TYPES_TRAVAUX.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Durée estimée (h)">
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={duree}
                  onChange={(e) => setDuree(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
              </Field>
              <Field label="Montant (€)">
                <input
                  type="number"
                  min={0}
                  value={montant}
                  onChange={(e) => setMontant(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          {/* Date */}
          <Section title="Planification">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input
                  type="date"
                  value={new Date(dateDebut).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setDateDebut(new Date(e.target.value + "T00:00:00").getTime())
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Heure">
                <input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            {adresse.lat && !isEdit && (
              <div className="mt-1">
                <button
                  onClick={() => setShowSuggestions((s) => !s)}
                  className="flex items-center gap-1.5 text-xs font-medium text-tuile-500 hover:text-tuile-600"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {showSuggestions ? "Masquer les suggestions" : "Voir les meilleurs créneaux"}
                </button>
                {showSuggestions && (
                  <div className="mt-2 space-y-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s.date}
                        onClick={() => setDateDebut(s.date)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                          dateDebut === s.date
                            ? "border-tuile-500 bg-tuile-50 dark:bg-tuile-500/10"
                            : "border-ardoise-200 hover:border-tuile-300 dark:border-ardoise-700"
                        )}
                      >
                        <span>
                          <span className="font-medium text-ardoise-900 dark:text-white">
                            {formatDateLongue(s.date)}
                          </span>
                          <br />
                          <span className="text-ardoise-400">{s.raison}</span>
                        </span>
                        <span className="rounded-full bg-success-500/10 px-2 py-0.5 font-semibold text-success-600">
                          {s.score}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Field label="Statut">
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as StatutChantier)}
                className={inputClass}
              >
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Précisions, accès, matériaux à prévoir..."
              className={inputClass}
            />
          </Section>

          {/* Photos & documents — disponibles seulement en édition (besoin d'un ID) */}
          {isEdit && (
            <Section title="Photos">
              <div className="flex flex-wrap gap-2">
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-16 w-16 overflow-hidden rounded-lg border border-ardoise-200 dark:border-ardoise-700"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ardoise-300 text-ardoise-400 hover:border-tuile-400 hover:text-tuile-500 dark:border-ardoise-600">
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                  />
                </label>
              </div>
            </Section>
          )}

          {isEdit && (
            <Section title="Documents">
              <div className="space-y-1.5">
                {documents.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-ardoise-200 px-3 py-2 text-xs hover:bg-ardoise-50 dark:border-ardoise-700 dark:hover:bg-ardoise-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-ardoise-400" />
                    <span className="truncate">{d.nom}</span>
                  </a>
                ))}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ardoise-300 px-3 py-2 text-xs text-ardoise-400 hover:border-tuile-400 hover:text-tuile-500 dark:border-ardoise-600">
                  {uploadingDoc ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Ajouter un document
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleDocUpload(e.target.files)}
                  />
                </label>
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          {isEdit ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          ) : (
            <span className="text-xs text-ardoise-400">
              {montant > 0 && formatMontant(montant)}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !clientNom.trim()}
            className="flex items-center gap-2 rounded-xl bg-tuile-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tuile-600 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le chantier"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-sm text-ardoise-900 outline-none transition-colors focus:border-tuile-500 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-white";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ardoise-400">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ardoise-500 dark:text-ardoise-400">
        {label}
      </label>
      {children}
    </div>
  );
}
