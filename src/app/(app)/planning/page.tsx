"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/use-app-data";
import { deplacerChantier } from "@/lib/chantiers";
import { createNotification } from "@/lib/notifications";
import { CalendarMonth, formatMoisAnnee } from "@/components/CalendarMonth";
import { CalendarWeek } from "@/components/CalendarWeek";
import { ChantierCard } from "@/components/ChantierCard";
import { ChantierDrawer } from "@/components/ChantierDrawer";
import { cn, formatDateLongue } from "@/lib/utils";
import type { Chantier } from "@/types";

type Vue = "jour" | "semaine" | "mois";

export default function PlanningPage() {
  const { user } = useAuth();
  const { chantiers, clients } = useAppData();
  const [vue, setVue] = useState<Vue>("mois");
  const [dateRef, setDateRef] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Chantier | null>(null);
  const [dateInitiale, setDateInitiale] = useState<number | null>(null);
  const [recherche, setRecherche] = useState("");

  const chantiersFiltres = useMemo(() => {
    if (!recherche.trim()) return chantiers;
    const q = recherche.toLowerCase();
    return chantiers.filter(
      (c) =>
        c.clientNom.toLowerCase().includes(q) ||
        c.adresse.ville.toLowerCase().includes(q)
    );
  }, [chantiers, recherche]);

  function ouvrirNouveau(date?: Date) {
    setEditing(null);
    setDateInitiale(date ? date.getTime() : Date.now());
    setDrawerOpen(true);
  }
  function ouvrirChantier(c: Chantier) {
    setEditing(c);
    setDateInitiale(null);
    setDrawerOpen(true);
  }
  function naviguer(sens: 1 | -1) {
    if (vue === "mois") setDateRef((d) => (sens === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    if (vue === "semaine") setDateRef((d) => (sens === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    if (vue === "jour") setDateRef((d) => addDays(d, sens));
  }
  async function handleDeplacer(chantierId: string, date: number) {
    if (!user) return;
    await deplacerChantier(user.uid, chantierId, date);
    const c = chantiers.find((ch) => ch.id === chantierId);
    if (c) {
      await createNotification(
        user.uid,
        "modification_planning",
        chantierId,
        "Planning modifié",
        `${c.clientNom} déplacé au ${new Date(date).toLocaleDateString("fr-FR")}`
      );
    }
  }

  const chantiersJour = chantiersFiltres
    .filter((c) => isSameDay(c.dateDebut, dateRef))
    .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      {/* En-tête */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
          Planning
        </h1>
        <button
          onClick={() => ouvrirNouveau()}
          className="flex items-center gap-2 rounded-xl bg-tuile-500 px-4 py-2.5 text-sm font-medium text-white shadow-premium transition-colors hover:bg-tuile-600"
        >
          <Plus className="h-4 w-4" /> Nouveau chantier
        </button>
      </div>

      {/* Contrôles */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => naviguer(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ardoise-200 bg-white text-ardoise-500 hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-900 dark:text-ardoise-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDateRef(new Date())}
            className="rounded-xl border border-ardoise-200 bg-white px-3 py-2 text-xs font-medium text-ardoise-600 hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-900 dark:text-ardoise-300"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => naviguer(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ardoise-200 bg-white text-ardoise-500 hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-900 dark:text-ardoise-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <p className="ml-2 font-display text-sm font-semibold capitalize text-ardoise-800 dark:text-white">
            {vue === "mois" ? formatMoisAnnee(dateRef) : formatDateLongue(dateRef.getTime())}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-ardoise-200 bg-white px-3 py-2 sm:flex dark:border-ardoise-700 dark:bg-ardoise-900">
            <Search className="h-3.5 w-3.5 text-ardoise-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client, une ville..."
              className="w-48 bg-transparent text-xs text-ardoise-700 outline-none placeholder:text-ardoise-400 dark:text-white"
            />
          </div>
          <div className="flex rounded-xl border border-ardoise-200 bg-white p-1 dark:border-ardoise-700 dark:bg-ardoise-900">
            {(["jour", "semaine", "mois"] as Vue[]).map((v) => (
              <button
                key={v}
                onClick={() => setVue(v)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  vue === v
                    ? "bg-tuile-500 text-white"
                    : "text-ardoise-500 hover:bg-ardoise-100 dark:text-ardoise-400 dark:hover:bg-ardoise-800"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vues */}
      {vue === "mois" && (
        <CalendarMonth
          mois={dateRef}
          chantiers={chantiersFiltres}
          onSelectChantier={ouvrirChantier}
          onSelectJour={(d) => {
            setDateRef(d);
            setVue("jour");
          }}
          onDeplacerChantier={handleDeplacer}
        />
      )}
      {vue === "semaine" && (
        <CalendarWeek
          semaine={dateRef}
          chantiers={chantiersFiltres}
          onSelectChantier={ouvrirChantier}
          onSelectJour={(d) => {
            setDateRef(d);
            setVue("jour");
          }}
          onDeplacerChantier={handleDeplacer}
        />
      )}
      {vue === "jour" && (
        <div>
          {chantiersJour.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ardoise-300 bg-white/50 px-6 py-16 text-center dark:border-ardoise-700 dark:bg-ardoise-900/50">
              <p className="mb-1 text-sm font-medium text-ardoise-700 dark:text-ardoise-200">
                Journée libre
              </p>
              <p className="mb-4 text-xs text-ardoise-400">
                Aucun chantier prévu ce jour-là.
              </p>
              <button
                onClick={() => ouvrirNouveau(dateRef)}
                className="rounded-xl bg-tuile-500 px-4 py-2 text-xs font-medium text-white hover:bg-tuile-600"
              >
                Planifier un chantier
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {chantiersJour.map((c) => (
                <ChantierCard key={c.id} chantier={c} onClick={() => ouvrirChantier(c)} />
              ))}
              {chantiersJour.length < 2 && (
                <button
                  onClick={() => ouvrirNouveau(dateRef)}
                  className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ardoise-300 text-ardoise-400 transition-colors hover:border-tuile-400 hover:text-tuile-500 dark:border-ardoise-700"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium">Ajouter un 2e rendez-vous</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <ChantierDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chantier={editing}
        chantiers={chantiers}
        clients={clients}
        dateInitiale={dateInitiale}
      />
    </div>
  );
}
