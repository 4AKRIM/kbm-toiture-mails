"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Mail,
  Users,
  Map,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/mails", label: "Mails", icon: Mail },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/carte", label: "Carte", icon: Map },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-ardoise-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tuile-500">
          <div className="roofline h-4 w-5 bg-white" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-white">
            KBM Toiture
          </p>
          <p className="text-[11px] leading-tight text-ardoise-400">Planning</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-tuile-500 text-white shadow-premium"
                  : "text-ardoise-300 hover:bg-ardoise-800 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ardoise-800 p-3">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ardoise-400 transition-colors hover:bg-ardoise-800 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
