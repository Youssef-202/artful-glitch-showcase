import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Loader2, Plus, AlertCircle, Mail, Lock, X, Crown, Star, Shield, Pencil, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "owner" | "deputy" | "leader" | "editor";
const ROLE_RANK: Record<Role, number> = { owner: 4, deputy: 3, leader: 2, editor: 1 };

const ROLE_META: Record<Role, { label: string; icon: any; classes: string }> = {
  owner:  { label: "القائد",  icon: Crown,  classes: "bg-amber-500/10 border-amber-500/40 text-amber-300" },
  deputy: { label: "النائب",  icon: Shield, classes: "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" },
  leader: { label: "ليدر",    icon: Star,   classes: "bg-violet-500/10 border-violet-500/40 text-violet-300" },
  editor: { label: "محرر",    icon: Pencil, classes: "bg-slate-500/10 border-slate-500/40 text-slate-300" },
};

export default function AdminAccess() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("editor");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: roleData }, { data, error }] = await Promise.all([
      (supabase as any).rpc("current_user_admin_role"),
      (supabase as any).from("admin_users").select("*").order("created_at", { ascending: false }),
    ]);
    setMyRole((roleData as Role) ?? null);
    if (error) setErr(error.message);
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const myRank = myRole ? ROLE_RANK[myRole] : 0;
  const canManage = myRank >= ROLE_RANK.deputy;

  const invoke = async (body: any) => {
    const { data, error } = await (supabase as any).functions.invoke("admin-create-user", { body });
    if (error || data?.error) {
      const msg = data?.error || error?.message || "فشل التنفيذ";
      toast.error(msg);
      return false;
    }
    return true;
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized || password.length < 8) {
      setErr("أدخل بريداً صحيحاً وكلمة مرور لا تقل عن 8 أحرف");
      setSaving(false); return;
    }
    const ok = await invoke({ action: "create", email: normalized, password, role: newRole });
    setSaving(false);
    if (!ok) return;
    toast.success("تمت الإضافة");
    setEmail(""); setPassword(""); setNewRole("editor"); setOpen(false);
    fetchAll();
  };

  const changeRole = async (row: any, role: Role) => {
    if (row.role === role) return;
    if (!(await invoke({ action: "update_role", id: row.id, role }))) return;
    toast.success("تم تحديث الدور");
    fetchAll();
  };

  const transferOwner = async (row: any) => {
    if (!confirm(`نقل القيادة إلى ${row.email}؟\nستصبح أنت نائباً بعدها.`)) return;
    if (!(await invoke({ action: "transfer_owner", id: row.id }))) return;
    toast.success("تم نقل القيادة بنجاح");
    fetchAll();
  };

  const removeAdmin = async (row: any) => {
    if (!confirm(`حذف صلاحية ${row.email}؟`)) return;
    if (!(await invoke({ action: "delete", id: row.id }))) return;
    toast.success("تم الحذف");
    fetchAll();
  };

  // available roles the current user is allowed to grant
  const grantableRoles: Role[] = (["deputy","leader","editor"] as Role[]).filter(r => ROLE_RANK[r] < myRank);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> صلاحيات وأدوار الفريق
          </h3>
          {myRole && (
            <p className="text-[11px] text-slate-400 mt-1">
              دورك الحالي: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${ROLE_META[myRole].classes}`}>
                {ROLE_META[myRole].label}
              </span>
            </p>
          )}
        </div>
        {canManage && (
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold flex items-center gap-2 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> إضافة عضو جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {(Object.keys(ROLE_META) as Role[]).map(r => {
          const M = ROLE_META[r]; const Icon = M.icon;
          const desc = r === "owner" ? "تحكم كامل + نقل القيادة"
            : r === "deputy" ? "إدارة كل المحتوى والأعضاء عدا القائد"
            : r === "leader" ? "إدارة المحتوى فقط"
            : "تحرير المحتوى بدون إدارة أعضاء";
          return (
            <div key={r} className={`p-3 rounded-xl border ${M.classes}`}>
              <div className="flex items-center gap-2 font-bold mb-1"><Icon className="w-4 h-4" /> {M.label}</div>
              <p className="text-[10px] opacity-80 leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>

      {err && (
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 inline ml-1" /> {err}
        </div>
      )}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">لا يوجد أعضاء.</div>
        ) : (
          <table className="w-full text-right text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">الدور</th>
                <th className="p-3">تاريخ الإضافة</th>
                <th className="p-3 text-center w-48">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((r) => {
                const role = (r.role ?? "editor") as Role;
                const M = ROLE_META[role];
                const RoleIcon = M.icon;
                const targetRank = ROLE_RANK[role];
                const canEditTarget = canManage && role !== "owner" && targetRank < myRank;
                return (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" /> {r.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${M.classes}`}>
                        <RoleIcon className="w-3 h-3" /> {M.label}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(r.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {canEditTarget && grantableRoles.length > 0 && (
                          <select
                            value={role}
                            onChange={(e) => changeRole(r, e.target.value as Role)}
                            className="bg-slate-800 border border-slate-700 text-white text-[11px] rounded px-2 py-1"
                          >
                            {(!grantableRoles.includes(role) ? [role, ...grantableRoles] : grantableRoles).map(op => (
                              <option key={op} value={op}>{ROLE_META[op].label}</option>
                            ))}
                          </select>
                        )}
                        {myRole === "owner" && role !== "owner" && (
                          <button
                            onClick={() => transferOwner(r)}
                            title="نقل القيادة"
                            className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          >
                            <Repeat className="w-4 h-4" />
                          </button>
                        )}
                        {canEditTarget && (
                          <button
                            onClick={() => removeAdmin(r)}
                            title="حذف"
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!canEditTarget && role === "owner" && (
                          <span className="text-[10px] text-amber-300/70">القائد الرئيسي</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel max-w-md w-full rounded-2xl my-4">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-base text-white">إضافة عضو جديد</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={addAdmin} className="p-6 space-y-4">
              <label className="block">
                <span className="text-[11px] text-slate-400 mb-1 block">البريد الإلكتروني</span>
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none" placeholder="name@example.com" />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] text-slate-400 mb-1 block">كلمة المرور</span>
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <input type="text" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none font-mono" placeholder="8 أحرف على الأقل" />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] text-slate-400 mb-1 block">الدور</span>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3 py-2.5 text-sm text-white outline-none">
                  {grantableRoles.map(r => (
                    <option key={r} value={r}>{ROLE_META[r].label} — {r === "deputy" ? "إدارة شبه كاملة" : r === "leader" ? "إدارة المحتوى" : "تحرير فقط"}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">لا تستطيع منح دور مساوٍ أو أعلى من دورك. القيادة تُنقل عبر زر منفصل.</p>
              </label>
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button disabled={saving} type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} إضافة
                </button>
                <button type="button" onClick={() => setOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
