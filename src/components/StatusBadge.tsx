import { STATUT_STYLES, type StatutChantier } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  statut,
  className,
}: {
  statut: StatutChantier;
  className?: string;
}) {
  const s = STATUT_STYLES[statut];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        s.bg,
        s.text,
        s.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
