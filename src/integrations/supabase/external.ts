// External Supabase project client (user-owned)
import { createClient } from "@supabase/supabase-js";

const EXTERNAL_URL = "https://oxglgoefgdzaohzudygo.supabase.co";
const EXTERNAL_ANON_KEY = "sb_publishable_EAouyGNN5vBDUvmyVKjGiw_HGJdrlVJ";

export const supabaseExternal = createClient(EXTERNAL_URL, EXTERNAL_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
