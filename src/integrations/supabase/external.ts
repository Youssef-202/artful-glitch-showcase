// External Supabase project client (user-owned)
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_URL = "https://oxglgoefgdzaohzudygo.supabase.co";
const EXTERNAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94Z2xnb2VmZ2R6YW9oenVkeWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzQyNjYsImV4cCI6MjA5Njk1MDI2Nn0.FLkCTftHhdAkEIPnIvtO_IFx0G1pmDSMef-LgHjhmCk";

export const supabaseExternal = createClient(EXTERNAL_URL, EXTERNAL_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "sb-external-auth",
  },
  db: { schema: "public" },
  global: { headers: { "X-Client-Info": "etqan-web" } },
});

// Re-export as `supabase` so existing imports from this module work seamlessly.
export const supabase = supabaseExternal;
