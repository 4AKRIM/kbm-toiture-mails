"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, TriangleAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ardoise-950 px-4">
      {/* Motif de fond — toiture stylisée */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute inset-0 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="roofline h-24 w-24 shrink-0 translate-y-[-10px] bg-tuile-400" />
          ))}
        </div>
      </div>
      <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-tuile-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tuile-500 shadow-premium">
            <div className="roofline h-6 w-7 bg-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">KBM Toiture</h1>
          <p className="mt-1 text-sm text-ardoise-400">Planning des chantiers</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-ardoise-800 bg-ardoise-900/80 p-6 shadow-2xl backdrop-blur"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-500">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-1.5 block text-xs font-medium text-ardoise-400">
            Adresse email
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-ardoise-700 bg-ardoise-800/60 px-3 py-2.5 focus-within:border-tuile-500 transition-colors">
            <Mail className="h-4 w-4 text-ardoise-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@kbmtoiture.fr"
              className="w-full bg-transparent text-sm text-white placeholder:text-ardoise-500 outline-none"
            />
          </div>

          <label className="mb-1.5 block text-xs font-medium text-ardoise-400">
            Mot de passe
          </label>
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-ardoise-700 bg-ardoise-800/60 px-3 py-2.5 focus-within:border-tuile-500 transition-colors">
            <Lock className="h-4 w-4 text-ardoise-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-white placeholder:text-ardoise-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-tuile-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tuile-600 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ardoise-500">
          Accès réservé à l&apos;équipe KBM Toiture.
        </p>
      </div>
    </div>
  );
}
