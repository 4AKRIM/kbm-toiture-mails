"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { Chantier } from "@/types";
import { ChantierCard } from "@/components/ChantierCard";
import { cn } from "@/lib/utils";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarMonth({
  mois,
  chantiers,
  onSelectChantier,
  onSelectJour,
  onDeplacerChantier,
}: {
  mois: Date;
  chantiers: Chantier[];
  onSelectChantier: (c: Chantier) => void;
  onSelectJour: (d: Date) => void;
  onDeplacerChantier: (chantierId: string, date: number) => void;
}) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const jours = useMemo(() => {
    const debut = startOfWeek(startOfMonth(mois), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mois), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: debut, end: fin });
  }, [mois]);

  function chantiersDuJour(jour: Date) {
    return chantiers
      .filter((c) => isSameDay(c.dateDebut, jour))
      .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ardoise-200 bg-white shadow-card dark:border-ardoise-800 dark:bg-ardoise-900">
      <div className="grid grid-cols-7 border-b border-ardoise-200 dark:border-ardoise-800">
        {JOURS.map((j) => (
          <div
            key={j}
            className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ardoise-400"
          >
            {j}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {jours.map((jour) => {
          const items = chantiersDuJour(jour);
          const dansLeMois = isSameMonth(jour, mois);
          const key = jour.toISOString();
          const isDragOver = dragOverDay === key;

          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDay(key);
              }}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => {
                e.preventDefault();
                const chantierId = e.dataTransfer.getData("text/plain");
                if (chantierId) onDeplacerChantier(chantierId, jour.getTime());
                setDragOverDay(null);
              }}
              onClick={() => onSelectJour(jour)}
              className={cn(
                "min-h-[92px] cursor-pointer border-b border-r border-ardoise-100 p-1.5 transition-colors last:border-r-0 dark:border-ardoise-800/60 sm:min-h-[110px]",
                !dansLeMois && "bg-ardoise-50/50 dark:bg-ardoise-950/40",
                isDragOver && "bg-tuile-50 dark:bg-tuile-500/10",
                items.length === 0 && dansLeMois && "hover:bg-ardoise-50 dark:hover:bg-ardoise-800/40"
              )}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                    isToday(jour)
                      ? "bg-tuile-500 text-white"
                      : dansLeMois
                      ? "text-ardoise-700 dark:text-ardoise-300"
                      : "text-ardoise-300 dark:text-ardoise-700"
                  )}
                >
                  {jour.getDate()}
                </span>
                {items.length === 0 && dansLeMois && (
                  <span className="h-1.5 w-1.5 rounded-full bg-success-500/50" title="Libre" />
                )}
              </div>
              <div className="space-y-1">
                {items.slice(0, 2).map((c) => (
                  <ChantierCard
                    key={c.id}
                    chantier={c}
                    compact
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                    onClick={() => onSelectChantier(c)}
                  />
                ))}
                {items.length > 2 && (
                  <p className="px-1 text-[10px] font-medium text-ardoise-400">
                    +{items.length - 2} autre{items.length - 2 > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function formatMoisAnnee(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// re-export util locale au cas où nécessaire ailleurs
export { fr };
