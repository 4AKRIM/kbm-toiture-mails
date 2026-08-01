"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeChantiers } from "@/lib/chantiers";
import { subscribeClients } from "@/lib/clients";
import type { Chantier, Client } from "@/types";

export function useAppData() {
  const { user } = useAuth();
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded >= 2) setLoading(false);
    };
    const unsub1 = subscribeChantiers(user.uid, (items) => {
      setChantiers(items);
      checkLoaded();
    });
    const unsub2 = subscribeClients(user.uid, (items) => {
      setClients(items);
      checkLoaded();
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  return { chantiers, clients, loading };
}
