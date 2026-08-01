"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ardoise-50 dark:bg-ardoise-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-tuile-500 border-t-transparent" />
    </div>
  );
}
