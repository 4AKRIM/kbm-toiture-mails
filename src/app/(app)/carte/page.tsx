"use client";

import { useMemo, useState } from "react";
import { isFuture, isToday } from "date-fns";
import { MapPin, Navigation, ArrowRight } from "lucide-react";
import { useAppData } from "@/lib/use-app-data";
import { adresseComplete, distanceKm, googleMapsSearchUrl } from "@/lib/geo";
import { formatDateCourte } from "@/lib/utils";
import { STATUT_STYLES } from "@/types";

export default function CartePage() {
  const { chantiers } = useAppData();

  const aVenir = useMemo(
    () =>
      chantiers
        .filter((c) => (isFuture(c.dateDebut) || isToday(c.dateDebut)) && c.statut !== "reporte")
        .sort((a, b) => a.dateDebut - b.dateDebut)
        .slice(0, 12),
    [chantiers]
  );

  const [selected, setSelected] = useState<string | null>(aVenir[0]?.id ?? null);
  const chantierSelectionne = aVenir.find((c) => c.id === selected) ?? aVenir[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ardoise-900 dark:text-white">
        Carte des chantiers
      </h1>
      <p className="mb-6 text-sm text-ardoise-500 dark:text-ardoise-400">
        Visualisez vos prochains chantiers et les distances entre eux.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Liste + distances */}
        <div className="space-y-2 lg:col-span-1">
          {aVenir.map((c, i) => {
            const suivant = aVenir[i + 1];
            const d = suivant ? distanceKm(c.adresse, suivant.adresse) : null;
            const s = STATUT_STYLES[c.statut];
            return (
              <div key={c.id}>
                <button
                  onClick={() => setSelected(c.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    selected === c.id
                      ? "border-tuile-400 bg-tuile-50 dark:bg-tuile-500/10"
                      : "border-ardoise-200 bg-white hover:bg-ardoise-50 dark:border-ardoise-800 dark:bg-ardoise-900 dark:hover:bg-ardoise-800/60"
                  }`}
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ardoise-900 dark:text-white">
                      {c.clientNom}
                    </p>
                    <p className="truncate text-xs text-ardoise-500 dark:text-ardoise-400">
                      {c.adresse.ville} · {formatDateCourte(c.dateDebut)}
                    </p>
                  </div>
                </button>
                {suivant && (
                  <div className="flex items-center gap-2 py-1.5 pl-4 text-[11px] text-ardoise-400">
                    <ArrowRight className="h-3 w-3" />
                    {d != null ? `${d} km jusqu'au suivant` : "distance inconnue"}
                  </div>
                )}
              </div>
            );
          })}
          {aVenir.length === 0 && (
            <p className="py-10 text-center text-sm text-ardoise-400">
              Aucun chantier à venir à afficher sur la carte.
            </p>
          )}
        </div>

        {/* Détail / carte embarquée */}
        <div className="lg:col-span-2">
          {chantierSelectionne ? (
            <div className="overflow-hidden rounded-2xl border border-ardoise-200 bg-white shadow-card dark:border-ardoise-800 dark:bg-ardoise-900">
              <iframe
                title="Carte"
                className="h-72 w-full sm:h-96"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  adresseComplete(chantierSelectionne.adresse)
                )}&output=embed`}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ardoise-900 dark:text-white">
                    <MapPin className="h-4 w-4 text-tuile-500" />
                    {adresseComplete(chantierSelectionne.adresse)}
                  </p>
                  <p className="text-xs text-ardoise-500 dark:text-ardoise-400">
                    {chantierSelectionne.clientNom} · {formatDateCourte(chantierSelectionne.dateDebut)}
                  </p>
                </div>
                <a
                  href={googleMapsSearchUrl(chantierSelectionne.adresse)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-tuile-500 px-3.5 py-2 text-xs font-medium text-white hover:bg-tuile-600"
                >
                  <Navigation className="h-3.5 w-3.5" /> Itinéraire Google Maps
                </a>
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-ardoise-300 text-sm text-ardoise-400 dark:border-ardoise-700">
              Sélectionnez un chantier pour l&apos;afficher sur la carte.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

