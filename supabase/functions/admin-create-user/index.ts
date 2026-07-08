// Manages admin access: create, update role, transfer ownership, delete.
// Only callable by authenticated admins with sufficient role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Role = "owner" | "deputy" | "leader" | "editor";
const ROLE_RANK: Record<Role, number> = { owner: 4, deputy: 3, leader: 2, editor: 1 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "missing auth" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // caller's role
    const callerEmail = (userData.user.email ?? "").toLowerCase();
    const { data: callerRow } = await admin
      .from("admin_users")
      .select("id,email,role")
      .ilike("email", callerEmail)
      .maybeSingle();
    if (!callerRow) return json({ error: "forbidden" }, 403);
    const callerRole = callerRow.role as Role;
    const callerRank = ROLE_RANK[callerRole];

    const body = await req.json();
    const action = (body?.action ?? "create").toString();

    // ------- CREATE -------
    if (action === "create") {
      if (callerRank < ROLE_RANK.deputy) return json({ error: "لا تملك صلاحية إضافة أدمن" }, 403);
      const email = (body?.email ?? "").toString().trim().toLowerCase();
      const password = (body?.password ?? "").toString();
      const role = (body?.role ?? "editor") as Role;
      if (!email || !password || password.length < 8) return json({ error: "بريد أو كلمة مرور غير صحيحة" }, 400);
      if (!ROLE_RANK[role]) return json({ error: "دور غير صالح" }, 400);
      if (role === "owner") return json({ error: "استخدم نقل القيادة لتعيين قائد" }, 400);
      if (ROLE_RANK[role] >= callerRank) return json({ error: "لا يمكن منح دور مساوٍ أو أعلى من دورك" }, 403);

      let userId: string | null = null;
      const createRes = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (createRes.error) {
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
        .upsert({ email, role, created_by: userData.user.id }, { onConflict: "email" });
      if (insErr) return json({ error: insErr.message }, 400);
      return json({ ok: true, user_id: userId, email, role });
    }

    // ------- UPDATE ROLE -------
    if (action === "update_role") {
      const targetId = (body?.id ?? "").toString();
      const newRole = (body?.role ?? "") as Role;
      if (!targetId || !ROLE_RANK[newRole]) return json({ error: "بيانات ناقصة" }, 400);
      if (newRole === "owner") return json({ error: "استخدم نقل القيادة" }, 400);

      const { data: target } = await admin.from("admin_users").select("id,email,role").eq("id", targetId).maybeSingle();
      if (!target) return json({ error: "غير موجود" }, 404);

      if (target.role === "owner") return json({ error: "لا يمكن تغيير دور القائد الرئيسي" }, 403);
      if (callerRank < ROLE_RANK.deputy) return json({ error: "لا تملك صلاحية" }, 403);
      if (ROLE_RANK[target.role as Role] >= callerRank) return json({ error: "الهدف بمستوى أعلى" }, 403);
      if (ROLE_RANK[newRole] >= callerRank) return json({ error: "لا يمكن منح دور مساوٍ أو أعلى" }, 403);

      const { error } = await admin.from("admin_users").update({ role: newRole }).eq("id", targetId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ------- TRANSFER OWNERSHIP -------
    if (action === "transfer_owner") {
      if (callerRole !== "owner") return json({ error: "القائد فقط يستطيع نقل القيادة" }, 403);
      const targetId = (body?.id ?? "").toString();
      const { data: target } = await admin.from("admin_users").select("id,email,role").eq("id", targetId).maybeSingle();
      if (!target) return json({ error: "غير موجود" }, 404);
      if (target.id === callerRow.id) return json({ error: "أنت القائد بالفعل" }, 400);

      // demote current owner -> deputy, promote target -> owner
      const { error: e1 } = await admin.from("admin_users").update({ role: "deputy" }).eq("id", callerRow.id);
      if (e1) return json({ error: e1.message }, 400);
      const { error: e2 } = await admin.from("admin_users").update({ role: "owner" }).eq("id", targetId);
      if (e2) {
        // rollback
        await admin.from("admin_users").update({ role: "owner" }).eq("id", callerRow.id);
        return json({ error: e2.message }, 400);
      }
      return json({ ok: true, new_owner: target.email });
    }

    // ------- DELETE -------
    if (action === "delete") {
      const targetId = (body?.id ?? "").toString();
      const { data: target } = await admin.from("admin_users").select("id,email,role").eq("id", targetId).maybeSingle();
      if (!target) return json({ error: "غير موجود" }, 404);
      if (target.role === "owner") return json({ error: "لا يمكن حذف القائد" }, 403);
      if (callerRank < ROLE_RANK.deputy) return json({ error: "لا تملك صلاحية" }, 403);
      if (ROLE_RANK[target.role as Role] >= callerRank) return json({ error: "الهدف بمستوى أعلى" }, 403);

      const { error } = await admin.from("admin_users").delete().eq("id", targetId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "action غير معروف" }, 400);
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
