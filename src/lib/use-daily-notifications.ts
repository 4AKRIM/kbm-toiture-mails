"use client";

import { useEffect } from "react";
import { isSameDay, isTomorrow } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { createNotification } from "@/lib/notifications";
import type { Chantier } from "@/types";

/**
 * Génère (une fois par jour, côté client) les notifications "chantier aujourd'hui"
 * et "chantier demain" pour les chantiers concernés. Un drapeau en localStorage
 * évite les doublons si l'utilisateur recharge la page plusieurs fois dans la journée.
 *
 * Pour une fiabilité totale (même application fermée), la même logique peut être
 * portée dans une Cloud Function planifiée (voir README).
 */
export function useDailyNotifications(chantiers: Chantier[]) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || chantiers.length === 0) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const flagKey = `kbm-notif-${user.uid}-${todayKey}`;
    if (localStorage.getItem(flagKey)) return;

    (async () => {
      for (const c of chantiers) {
        if (c.statut === "termine" || c.statut === "reporte") continue;
        if (isSameDay(c.dateDebut, new Date())) {
          await createNotification(
            user.uid,
            "chantier_aujourdhui",
            c.id,
            "Chantier aujourd'hui",
            `${c.clientNom} — ${c.adresse.ville} à ${c.heureDebut}`
          );
        } else if (isTomorrow(c.dateDebut)) {
          await createNotification(
            user.uid,
            "chantier_demain",
            c.id,
            "Chantier demain",
            `${c.clientNom} — ${c.adresse.ville} à ${c.heureDebut}`
          );
        }
      }
      localStorage.setItem(flagKey, "1");
    })();
  }, [user, chantiers]);
}
