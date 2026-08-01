"use client";

import { useMemo, useState } from "react";
import { isSameDay, isSameWeek, isFuture, startOfDay, addDays } from "date-fns";
import { Plus, TrendingUp, CalendarCheck, CalendarClock, CalendarX2 } from "lucide-react";
import { useAppData } from "@/lib/use-app-data";
import { ChantierCard } from "@/components/ChantierCard";
import { ChantierDrawer } from "@/components/ChantierDrawer";
import { formatMontant, formatDateLongue } from "@/lib/utils";
import type { Chantier } from "@/types";

export default function DashboardPage() {
  const { chantiers, clients, loading } = useAppData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Chantier | null>(null);

  const today = startOfDay(new Date());

  const prochains = useMemo(
    () =>
      chantiers
        .filter((c) => isFuture(c.dateDebut) || isSameDay(c.dateDebut, today))
        .filter((c) => c.statut !== "termine" && c.statut !== "reporte")
        .sort((a, b) => a.dateDebut - b.dateDebut)
        .slice(0, 5),
    [chantiers, today]
  );

  const cetteSemaine = chantiers.filter((c) => isSameWeek(c.dateDebut, today, { weekStartsOn: 1 }));
  const termines = chantiers.filter((c) => c.statut === "termine");
  const caPrevu = chantiers
    .filter((c) => c.statut !== "reporte")
    .reduce((sum, c) => sum + c.montant, 0);

  const joursLibresProchains = useMemo(() => {
    const jours: Date[] = [];
    let d = addDays(today, 1);
    while (jours.length < 5) {
      const occupe = chantiers.some((c) => isSameDay(c.dateDebut, d));
      if (!occupe && d.getDay() !== 0 && d.getDay() !== 6) jours.push(d);
      d = addDays(d, 1);
      if (jours.length >= 5 || d.getTime() - today.getTime() > 1000 * 60 * 60 * 24 * 30) break;
    }
    return jours;
  }, [chantiers, today]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-sm text-ardoise-500 dark:text-ardoise-400">
            {formatDateLongue(today.getTime())}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-tuile-500 px-4 py-2.5 text-sm font-medium text-white shadow-premium transition-colors hover:bg-tuile-600"
        >
          <Plus className="h-4 w-4" /> Nouveau chantier
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Cette semaine"
          value={String(cetteSemaine.length)}
          sub="chantiers planifiés"
          color="info"
        />
        <StatCard
          icon={CalendarCheck}
          label="Jours libres"
          value={String(joursLibresProchains.length)}
          sub="dans les 30 prochains jours"
          color="success"
        />
        <StatCard
          icon={CalendarX2}
          label="Terminés"
          value={String(termines.length)}
          sub="chantiers réalisés"
          color="ardoise"
        />
        <StatCard
          icon={TrendingUp}
          label="CA prévisionnel"
          value={formatMontant(caPrevu)}
          sub="tous chantiers actifs"
          color="tuile"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prochains chantiers */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-base font-semibold text-ardoise-900 dark:text-white">
            Prochains chantiers
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))}
            </div>
          ) : prochains.length === 0 ? (
            <EmptyState onCreate={() => setDrawerOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {prochains.map((c) => (
                <ChantierCard
                  key={c.id}
                  chantier={c}
                  onClick={() => {
                    setEditing(c);
                    setDrawerOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Jours libres */}
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-ardoise-900 dark:text-white">
            Prochains jours libres
          </h2>
          <div className="rounded-2xl border border-ardoise-200 bg-white p-2 shadow-card dark:border-ardoise-800 dark:bg-ardoise-900">
            {joursLibresProchains.map((d) => (
              <button
                key={d.toISOString()}
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-ardoise-50 dark:hover:bg-ardoise-800"
              >
                <span className="text-ardoise-700 dark:text-ardoise-200">
                  {formatDateLongue(d.getTime())}
                </span>
                <span className="h-2 w-2 rounded-full bg-success-500" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChantierDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chantier={editing}
        chantiers={chantiers}
        clients={clients}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub: string;
  color: "info" | "success" | "ardoise" | "tuile";
}) {
  const colors: Record<string, string> = {
    info: "bg-info-50 text-info-600 dark:bg-info-500/10",
    success: "bg-success-50 text-success-600 dark:bg-success-500/10",
    ardoise: "bg-ardoise-100 text-ardoise-600 dark:bg-ardoise-800",
    tuile: "bg-tuile-50 text-tuile-600 dark:bg-tuile-500/10",
  };
  return (
    <div className="rounded-2xl border border-ardoise-200 bg-white p-4 shadow-card dark:border-ardoise-800 dark:bg-ardoise-900">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-xl font-semibold text-ardoise-900 dark:text-white">
        {value}
      </p>
      <p className="text-xs font-medium text-ardoise-600 dark:text-ardoise-300">{label}</p>
      <p className="text-[11px] text-ardoise-400">{sub}</p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ardoise-300 bg-white/50 px-6 py-12 text-center dark:border-ardoise-700 dark:bg-ardoise-900/50">
      <p className="mb-1 text-sm font-medium text-ardoise-700 dark:text-ardoise-200">
        Aucun chantier à venir
      </p>
      <p className="mb-4 text-xs text-ardoise-400">
        Ajoutez votre prochain rendez-vous pour commencer à remplir le planning.
      </p>
      <button
        onClick={onCreate}
        className="rounded-xl bg-tuile-500 px-4 py-2 text-xs font-medium text-white hover:bg-tuile-600"
      >
        Ajouter un chantier
      </button>
    </div>
  );
}
