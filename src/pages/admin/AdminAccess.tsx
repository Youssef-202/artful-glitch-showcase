import { useEffect, useState } from "react";
import { ShieldCheck, Trash2, Loader2, Plus, AlertCircle, Mail, Lock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ADMIN_EMAIL } from "./AdminLogin";

export default function AdminAccess() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchRows();
  }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized || password.length < 8) {
      setErr("أدخل بريداً صحيحاً وكلمة مرور لا تقل عن 8 أحرف");
      setSaving(false);
      return;
    }
    const { data, error } = await (supabase as any).functions.invoke("admin-create-user", {
      body: { email: normalized, password },
    });
    setSaving(false);
    if (error || data?.error) {
      const msg = data?.error || error?.message || "فشل إضافة الأدمن";
      setErr(msg);
      toast.error(msg);
      return;
    }
    toast.success("تمت إضافة الأدمن بنجاح");
    setEmail("");
    setPassword("");
    setOpen(false);
    fetchRows();
  };

  const removeAdmin = async (row: any) => {
    if (row.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      toast.error("لا يمكن حذف الأدمن الرئيسي");
      return;
    }
    if (!confirm(`حذف صلاحية ${row.email}؟`)) return;
    const { error } = await (supabase as any).from("admin_users").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("تم حذف الصلاحية");
    fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" /> صلاحيات الدخول للوحة التحكم
        </h3>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold flex items-center gap-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> إضافة أدمن جديد
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        أضف بريداً إلكترونياً وكلمة مرور لمنح حساب جديد صلاحية الدخول الكامل للوحة التحكم. يمكنك سحب الصلاحية في أي وقت.
      </p>

      {err && (
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 inline ml-1" /> {err}
        </div>
      )}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">لا يوجد أدمن.</div>
        ) : (
          <table className="w-full text-right text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">تاريخ الإضافة</th>
                <th className="p-3 text-center w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((r) => {
                const isMain = r.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                return (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      {r.email}
                      {isMain && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                          رئيسي
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(r.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        <button
                          disabled={isMain}
                          onClick={() => removeAdmin(r)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <h4 className="font-bold text-base text-white">إضافة أدمن جديد</h4>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={addAdmin} className="p-6 space-y-4">
              <label className="block">
                <span className="text-[11px] text-slate-400 mb-1 block">البريد الإلكتروني</span>
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] text-slate-400 mb-1 block">كلمة المرور</span>
                <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none font-mono"
                    placeholder="8 أحرف على الأقل"
                  />
                </div>
              </label>
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
