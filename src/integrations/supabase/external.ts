// Backend client — uses the project's internal backend (Lovable Cloud).
// No external Supabase connection.
import { supabase as internalSupabase } from "./client";

// Untyped alias so legacy admin pages that reference tables/columns
// outside the generated schema continue to compile.
export const supabase = internalSupabase as any;
export const supabaseExternal = internalSupabase as any;
