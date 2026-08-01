import { addDays, isWeekend, startOfDay } from "date-fns";
import type { Adresse, Chantier, SuggestionCreneau } from "@/types";
import { distanceKm } from "@/lib/geo";

const JOURS_A_ANALYSER = 21; // ~3 semaines glissantes
const MAX_CHANTIERS_PAR_JOUR = 2;
const RAYON_PROCHE_KM = 15;

/**
 * Propose les meilleurs créneaux pour un nouveau chantier, en tenant compte :
 * - de la charge déjà planifiée ce jour-là (1 chantier/jour visé, 2 max),
 * - de la proximité géographique avec les chantiers déjà prévus les jours voisins
 *   (pour éviter les allers-retours inutiles),
 * - d'une préférence pour les jours ouvrés.
 *
 * Retourne une liste triée du meilleur au moins bon créneau.
 */
export function suggererCreneaux(
  chantiers: Chantier[],
  nouvelleAdresse: Adresse,
  dureeHeures: number,
  depuis: Date = new Date()
): SuggestionCreneau[] {
  const suggestions: SuggestionCreneau[] = [];
  const debut = startOfDay(depuis);

  for (let i = 1; i <= JOURS_A_ANALYSER; i++) {
    const jour = addDays(debut, i);
    const jourMs = jour.getTime();

    const chantiersDuJour = chantiers.filter(
      (c) => startOfDay(new Date(c.dateDebut)).getTime() === jourMs
    );

    // Jour saturé : on garde la possibilité (RDV exceptionnel) mais on la déclasse fortement.
    const saturé = chantiersDuJour.length >= MAX_CHANTIERS_PAR_JOUR;
    const jourLibre = chantiersDuJour.length === 0;

    let score = 100;
    const raisons: string[] = [];

    if (jourLibre) {
      score += 20;
      raisons.push("journée totalement libre");
    } else if (chantiersDuJour.length === 1) {
      score -= 10;
      raisons.push("1 chantier déjà prévu ce jour-là");
    }
    if (saturé) {
      score -= 60;
      raisons.push("journée déjà à 2 chantiers");
    }

    // Bonus week-end défavorisé (chantiers de couverture = jours ouvrés en priorité)
    if (isWeekend(jour)) {
      score -= 25;
      raisons.push("week-end");
    }

    // Proximité géographique avec les chantiers des jours voisins (J-1, J, J+1)
    let meilleureDistance: number | null = null;
    const joursVoisins = [addDays(jour, -1), jour, addDays(jour, 1)];
    for (const jv of joursVoisins) {
      const jvMs = startOfDay(jv).getTime();
      const voisins = chantiers.filter(
        (c) => startOfDay(new Date(c.dateDebut)).getTime() === jvMs
      );
      for (const v of voisins) {
        const d = distanceKm(nouvelleAdresse, v.adresse);
        if (d != null && (meilleureDistance == null || d < meilleureDistance)) {
          meilleureDistance = d;
        }
      }
    }

    if (meilleureDistance != null) {
      if (meilleureDistance <= RAYON_PROCHE_KM) {
        score += 15;
        raisons.push(`proche d'un chantier voisin (${meilleureDistance} km)`);
      } else if (meilleureDistance > 50) {
        score -= 10;
        raisons.push(`chantier voisin éloigné (${meilleureDistance} km)`);
      }
    }

    // Priorité aux jours les plus proches à score égal (organisation fluide)
    score -= i * 0.5;

    suggestions.push({
      date: jourMs,
      score: Math.max(0, Math.round(score)),
      raison: raisons.join(" · ") || "créneau disponible",
      distanceKm: meilleureDistance ?? undefined,
      jourLibre,
    });
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}
