"use client";

import { MapPin, Clock } from "lucide-react";
import type { Chantier } from "@/types";
import { STATUT_STYLES, TYPES_TRAVAUX } from "@/types";
import { cn, formatMontant } from "@/lib/utils";

export function ChantierCard({
  chantier,
  onClick,
  draggable,
  onDragStart,
  compact,
}: {
  chantier: Chantier;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  compact?: boolean;
}) {
  const s = STATUT_STYLES[chantier.statut];
  const typeLabel = TYPES_TRAVAUX.find((t) => t.value === chantier.typeTravaux)?.label;

  if (compact) {
    return (
      <button
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        className={cn(
          "flex w-full items-center gap-1.5 truncate rounded-lg border-l-2 px-2 py-1 text-left text-[11px] font-medium transition-transform hover:scale-[1.02]",
          s.bg,
          s.text,
          s.border
        )}
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
        <span className="truncate">{chantier.clientNom}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className="group flex w-full flex-col gap-2 rounded-2xl border border-ardoise-200 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-ardoise-800 dark:bg-ardoise-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ardoise-900 dark:text-white">
            {chantier.clientNom}
          </p>
          <p className="truncate text-xs text-ardoise-500 dark:text-ardoise-400">{typeLabel}</p>
        </div>
        <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-ardoise-500 dark:text-ardoise-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{chantier.adresse.ville}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-ardoise-500 dark:text-ardoise-400">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>{chantier.heureDebut} · {chantier.dureeEstimeeHeures}h</span>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
            s.bg,
            s.text,
            s.border
          )}
        >
          {s.label}
        </span>
        <span className="font-mono text-xs font-medium text-ardoise-700 dark:text-ardoise-300">
          {formatMontant(chantier.montant)}
        </span>
      </div>
    </button>
  );
}
