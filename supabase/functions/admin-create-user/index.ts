// Creates a new admin user (auth account + admin_users entry).
// Only callable by an already authenticated admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "missing auth" }, 401);

    // Verify caller is an admin using their JWT
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const { data: isAdmin, error: adminErr } = await userClient.rpc("current_user_is_admin");
    if (adminErr || !isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();
    if (!email || !password || password.length < 8) {
      return json({ error: "Invalid email or password (min 8 chars)" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to create the user; if already exists, just (re)set password.
    let userId: string | null = null;
    const createRes = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createRes.error) {
      // user may already exist — find them
      const list = await admin.auth.admin.listUsers();
      const existing = list.data?.users?.find((u: any) => u.email?.toLowerCase() === email);
      if (!existing) return json({ error: createRes.error.message }, 400);
      userId = existing.id;
      await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    } else {
      userId = createRes.data.user?.id ?? null;
    }

    const { error: insErr } = await admin
      .from("admin_users")
      .upsert({ email, created_by: userData.user.id }, { onConflict: "email" });
    if (insErr) return json({ error: insErr.message }, 400);

    return json({ ok: true, user_id: userId, email });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
