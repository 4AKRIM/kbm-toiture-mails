"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kbm-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le mode sombre"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-ardoise-200 bg-white text-ardoise-600 transition-colors hover:bg-ardoise-50 dark:border-ardoise-700 dark:bg-ardoise-800 dark:text-ardoise-300 dark:hover:bg-ardoise-700"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
