import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const memoryStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
})();

let client: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file."
  );
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: memoryStorage,
    },
  });
}

export const supabase = client;
export const isSupabaseConfigured = Boolean(client);
