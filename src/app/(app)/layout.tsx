"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/use-app-data";
import { useDailyNotifications } from "@/lib/use-daily-notifications";
import { Sidebar } from "@/components/Sidebar";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { NotificationBell } from "@/components/NotificationBell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { chantiers } = useAppData();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useDailyNotifications(chantiers);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ardoise-50 dark:bg-ardoise-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-tuile-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ardoise-50 dark:bg-ardoise-950">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-slide-in-right shadow-2xl">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-ardoise-400 hover:bg-ardoise-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ardoise-200 bg-white/80 px-4 backdrop-blur dark:border-ardoise-800 dark:bg-ardoise-900/80 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ardoise-600 hover:bg-ardoise-100 dark:text-ardoise-300 dark:hover:bg-ardoise-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DarkModeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
