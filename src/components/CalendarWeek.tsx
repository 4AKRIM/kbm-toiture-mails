"use client";

import { useMemo, useState } from "react";
import { startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import type { Chantier } from "@/types";
import { ChantierCard } from "@/components/ChantierCard";
import { cn } from "@/lib/utils";

export function CalendarWeek({
  semaine,
  chantiers,
  onSelectChantier,
  onSelectJour,
  onDeplacerChantier,
}: {
  semaine: Date;
  chantiers: Chantier[];
  onSelectChantier: (c: Chantier) => void;
  onSelectJour: (d: Date) => void;
  onDeplacerChantier: (chantierId: string, date: number) => void;
}) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const jours = useMemo(() => {
    const debut = startOfWeek(semaine, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(debut, i));
  }, [semaine]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {jours.map((jour) => {
        const items = chantiers
          .filter((c) => isSameDay(c.dateDebut, jour))
          .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
        const key = jour.toISOString();
        const isDragOver = dragOverDay === key;
        const weekend = jour.getDay() === 0 || jour.getDay() === 6;

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
            className={cn(
              "flex min-h-[160px] flex-col rounded-2xl border p-2.5 transition-colors",
              isDragOver
                ? "border-tuile-400 bg-tuile-50 dark:bg-tuile-500/10"
                : "border-ardoise-200 bg-white dark:border-ardoise-800 dark:bg-ardoise-900",
              weekend && "bg-ardoise-50/60 dark:bg-ardoise-950/40"
            )}
          >
            <button
              onClick={() => onSelectJour(jour)}
              className="mb-2 flex items-center justify-between px-0.5"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ardoise-400">
                  {jour.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p
                  className={cn(
                    "font-display text-sm font-semibold",
                    isToday(jour) ? "text-tuile-500" : "text-ardoise-800 dark:text-white"
                  )}
                >
                  {jour.getDate()}
                </p>
              </div>
              {items.length === 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-success-500/60" title="Libre" />
              )}
            </button>
            <div className="flex-1 space-y-1.5">
              {items.map((c) => (
                <ChantierCard
                  key={c.id}
                  chantier={c}
                  compact
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                  onClick={() => onSelectChantier(c)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
