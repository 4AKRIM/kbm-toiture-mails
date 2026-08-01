import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(montant);
}

export function formatDateCourte(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(ts));
}

export function formatDateLongue(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(ts));
}

export function formatDureeHeures(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (Number.isInteger(h)) return `${h}h`;
  return `${Math.floor(h)}h${Math.round((h % 1) * 60)}`;
}

export function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
