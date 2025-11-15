import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),

  initialize: async () => {
    if (!supabase) {
      set({ loading: false });
      console.warn("Supabase is not configured; skipping auth initialization.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },
}));
