"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Paperclip,
  Search,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeMails, validerReponse, ignorerMail, remettreEnAttente } from "@/lib/emails";
import { CATEGORIES_MAIL, type MailAnalyse, type CategorieMail } from "@/types";
import { cn } from "@/lib/utils";

const FILTRES_STATUT = [
  { value: "a_valider", label: "À valider" },
  { value: "a_envoyer", label: "En cours d'envoi" },
  { value: "envoye", label: "Envoyés" },
  { value: "ignore", label: "Ignorés" },
] as const;

export default function MailsPage() {
  const { user } = useAuth();
  const [mails, setMails] = useState<MailAnalyse[]>([]);
  const [statutFiltre, setStatutFiltre] = useState<(typeof FILTRES_STATUT)[number]["value"]>("a_valider");
  const [categorieFiltre, setCategorieFiltre] = useState<CategorieMail | "toutes">("toutes");
  const [recherche, setRecherche] = useState("");
  const [selected, setSelected] = useState<MailAnalyse | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeMails(user.uid, setMails);
  }, [user]);

  const filtres = useMemo(() => {
    let items = mails.filter((m) => m.statut === statutFiltre);
    if (categorieFiltre !== "toutes") items = items.filter((m) => m.categorie === categorieFiltre);
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      items = items.filter(
        (m) =>
          m.sujet.toLowerCase().includes(q) ||
          m.nomExpediteur.toLowerCase().includes(q) ||
          m.de.toLowerCase().includes(q) ||
          m.infos.nom?.toLowerCase().includes(q) ||
          m.infos.ville?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [mails, statutFiltre, categorieFiltre, recherche]);

  const compteurs = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of FILTRES_STATUT) c[f.value] = mails.filter((m) => m.statut === f.value).length;
    return c;
  }, [mails]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
            Mails
          </h1>
          <p className="text-sm text-ardoise-500 dark:text-ardoise-400">
            Classés et résumés automatiquement par l&apos;IA
          </p>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES_STATUT.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatutFiltre(f.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
              statutFiltre === f.value
                ? "border-tuile-500 bg-tuile-500 text-white"
                : "border-ardoise-200 bg-white text-ardoise-600 hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-900 dark:text-ardoise-300"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] font-semibold",
                statutFiltre === f.value ? "bg-white/25" : "bg-ardoise-100 dark:bg-ardoise-800"
              )}
            >
              {compteurs[f.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Recherche + catégories */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-ardoise-200 bg-white px-3 py-2 dark:border-ardoise-700 dark:bg-ardoise-900">
          <Search className="h-3.5 w-3.5 text-ardoise-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Nom, ville, sujet..."
            className="w-48 bg-transparent text-xs text-ardoise-700 outline-none placeholder:text-ardoise-400 dark:text-white"
          />
        </div>
        <select
          value={categorieFiltre}
          onChange={(e) => setCategorieFiltre(e.target.value as CategorieMail | "toutes")}
          className="rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-xs text-ardoise-600 outline-none dark:border-ardoise-700 dark:bg-ardoise-900 dark:text-ardoise-300"
        >
          <option value="toutes">Toutes catégories</option>
          {CATEGORIES_MAIL.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {filtres.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ardoise-300 bg-white/50 px-6 py-16 text-center dark:border-ardoise-700 dark:bg-ardoise-900/50">
          <Mail className="mb-2 h-6 w-6 text-ardoise-300" />
          <p className="text-sm font-medium text-ardoise-700 dark:text-ardoise-200">
            Rien ici pour l&apos;instant
          </p>
          <p className="text-xs text-ardoise-400">
            Les nouveaux mails apparaissent automatiquement après chaque synchronisation.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtres.map((m) => (
            <MailRow key={m.id} mail={m} onClick={() => setSelected(m)} />
          ))}
        </div>
      )}

      {selected && (
        <MailDetail
          mail={selected}
          onClose={() => setSelected(null)}
          onValider={async (texte) => {
            if (!user) return;
            await validerReponse(user.uid, selected.id, texte);
            setSelected(null);
          }}
          onIgnorer={async () => {
            if (!user) return;
            await ignorerMail(user.uid, selected.id);
            setSelected(null);
          }}
          onRemettreEnAttente={async () => {
            if (!user) return;
            await remettreEnAttente(user.uid, selected.id);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function MailRow({ mail, onClick }: { mail: MailAnalyse; onClick: () => void }) {
  const cat = CATEGORIES_MAIL.find((c) => c.value === mail.categorie);
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-ardoise-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ardoise-800 dark:bg-ardoise-900"
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", cat?.couleur)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ardoise-900 dark:text-white">
            {mail.nomExpediteur || mail.de}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {mail.urgence === "haute" && <AlertTriangle className="h-3.5 w-3.5 text-danger-500" />}
            {mail.piecesJointes.length > 0 && (
              <Paperclip className="h-3.5 w-3.5 text-ardoise-400" />
            )}
          </div>
        </div>
        <p className="truncate text-sm text-ardoise-700 dark:text-ardoise-300">{mail.sujet}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-ardoise-400">
          <Sparkles className="h-3 w-3 shrink-0 text-tuile-400" />
          {mail.resume}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-ardoise-100 px-2 py-0.5 text-[11px] font-medium text-ardoise-600 dark:bg-ardoise-800 dark:text-ardoise-300">
        {cat?.label}
      </span>
    </button>
  );
}

function MailDetail({
  mail,
  onClose,
  onValider,
  onIgnorer,
  onRemettreEnAttente,
}: {
  mail: MailAnalyse;
  onClose: () => void;
  onValider: (texte: string) => void;
  onIgnorer: () => void;
  onRemettreEnAttente: () => void;
}) {
  const [reponse, setReponse] = useState(mail.reponseModifiee ?? mail.reponseSuggeree);
  const cat = CATEGORIES_MAIL.find((c) => c.value === mail.categorie);
  const infosRemplies = Object.entries(mail.infos).filter(([, v]) => v);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-2xl dark:bg-ardoise-900">
        <div className="flex items-center justify-between border-b border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold text-ardoise-900 dark:text-white">
              {mail.sujet}
            </h2>
            <p className="truncate text-xs text-ardoise-400">
              {mail.nomExpediteur} · {mail.de}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ardoise-400 hover:bg-ardoise-100 dark:hover:bg-ardoise-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <span
            className={cn(
              "mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white",
              cat?.couleur
            )}
          >
            {cat?.label}
          </span>

          <Section title="Résumé IA">
            <p className="text-sm text-ardoise-700 dark:text-ardoise-300">{mail.resume}</p>
          </Section>

          {infosRemplies.length > 0 && (
            <Section title="Informations extraites">
              <div className="grid grid-cols-2 gap-2">
                {infosRemplies.map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-ardoise-50 px-3 py-2 dark:bg-ardoise-800">
                    <p className="text-[10px] uppercase tracking-wide text-ardoise-400">{k}</p>
                    <p className="truncate text-xs font-medium text-ardoise-800 dark:text-ardoise-200">
                      {String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Extrait du mail">
            <p className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ardoise-50 p-3 text-xs text-ardoise-600 dark:bg-ardoise-800 dark:text-ardoise-300">
              {mail.extrait}
            </p>
          </Section>

          {mail.necessiteReponse ? (
            <Section title="Réponse suggérée — modifiable avant envoi">
              <textarea
                value={reponse}
                onChange={(e) => setReponse(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-sm text-ardoise-900 outline-none transition-colors focus:border-tuile-500 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-white"
              />
            </Section>
          ) : (
            <p className="text-xs italic text-ardoise-400">
              L&apos;IA estime qu&apos;aucune réponse n&apos;est nécessaire pour ce mail.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-ardoise-200 px-5 py-4 dark:border-ardoise-800">
          <div className="flex gap-2">
            <button
              onClick={onIgnorer}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ardoise-500 hover:bg-ardoise-100 dark:hover:bg-ardoise-800"
            >
              <X className="h-4 w-4" /> Ignorer
            </button>
            {mail.statut !== "a_valider" && (
              <button
                onClick={onRemettreEnAttente}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ardoise-500 hover:bg-ardoise-100 dark:hover:bg-ardoise-800"
              >
                <RotateCcw className="h-4 w-4" /> Remettre en attente
              </button>
            )}
          </div>
          {mail.necessiteReponse && (
            <button
              onClick={() => onValider(reponse)}
              className="flex items-center gap-2 rounded-xl bg-tuile-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-tuile-600"
            >
              <Check className="h-4 w-4" /> Valider et envoyer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ardoise-400">
        {title}
      </h3>
      {children}
    </div>
  );
}
