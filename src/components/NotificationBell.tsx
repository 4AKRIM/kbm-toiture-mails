"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarClock, PencilLine, CalendarX, CheckCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeNotifications, marquerNotificationLue } from "@/lib/notifications";
import type { AppNotification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationType, typeof Bell> = {
  chantier_demain: CalendarClock,
  chantier_aujourdhui: CalendarClock,
  modification_planning: PencilLine,
  chantier_reporte: CalendarX,
};

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeNotifications(user.uid, setItems);
  }, [user]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const nonLues = items.filter((n) => !n.lu).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-ardoise-200 bg-white text-ardoise-600 transition-colors hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-ardoise-300 dark:hover:bg-ardoise-700"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {nonLues > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tuile-500 px-1 text-[10px] font-semibold text-white">
            {nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 animate-scale-in rounded-2xl border border-ardoise-200 bg-white p-2 shadow-2xl origin-top-right dark:border-ardoise-700 dark:bg-ardoise-800">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold text-ardoise-900 dark:text-white">
              Notifications
            </p>
            {nonLues > 0 && (
              <button
                onClick={() => {
                  if (!user) return;
                  items.filter((n) => !n.lu).forEach((n) => marquerNotificationLue(user.uid, n.id));
                }}
                className="flex items-center gap-1 text-xs font-medium text-tuile-500 hover:text-tuile-600"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-ardoise-400">
                Aucune notification pour l&apos;instant.
              </p>
            )}
            {items.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => user && marquerNotificationLue(user.uid, n.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ardoise-50 dark:hover:bg-ardoise-700/60",
                    !n.lu && "bg-tuile-50 dark:bg-tuile-500/10"
                  )}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-tuile-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ardoise-900 dark:text-white">
                      {n.titre}
                    </p>
                    <p className="truncate text-xs text-ardoise-500 dark:text-ardoise-400">
                      {n.message}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
