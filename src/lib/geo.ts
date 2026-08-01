import type { Adresse } from "@/types";

/**
 * Distance à vol d'oiseau entre deux points, en kilomètres (formule de Haversine).
 * Sert d'estimation rapide pour prioriser les créneaux sans dépendre d'une API
 * de calcul d'itinéraire payante.
 */
export function distanceKm(a: Adresse, b: Adresse): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return null;
  }
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function adresseComplete(a: Adresse): string {
  return `${a.rue}, ${a.codePostal} ${a.ville}`;
}

export function googleMapsItineraireUrl(depart: Adresse, arrivee: Adresse): string {
  const origin = encodeURIComponent(adresseComplete(depart));
  const dest = encodeURIComponent(adresseComplete(arrivee));
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
}

export function googleMapsSearchUrl(a: Adresse): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    adresseComplete(a)
  )}`;
}

/**
 * Géocodage via l'API publique gratuite de la Base Adresse Nationale (data.gouv.fr).
 * Aucune clé API requise — idéal pour un outil léger d'artisan en France.
 */
export async function geocoderAdresse(
  adresse: Adresse
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(adresseComplete(adresse));
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${q}&limit=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const feature = json?.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.geometry.coordinates;
    return { lat, lng };
  } catch {
    return null;
  }
}
