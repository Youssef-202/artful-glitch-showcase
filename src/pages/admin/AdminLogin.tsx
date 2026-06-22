import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseExternal } from "@/integrations/supabase/external";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

// Primary/root admin — cannot be removed from the admin list.
export const ADMIN_EMAIL = "youssf582022@gmail.com";

// Returns true if the currently signed-in user is in the admin_users table.
export async function checkCurrentUserIsAdmin(): Promise<boolean> {
  const { data, error } = await supabaseExternal.rpc("current_user_is_admin");
  if (error) return false;
  return !!data;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabaseExternal.auth.getSession();
      if (data.session) {
        const ok = await checkCurrentUserIsAdmin();
        if (ok) navigate("/admin-dashboard010", { replace: true });
      }
    })();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    const { data, error } = await supabaseExternal.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      toast.error("بيانات الدخول غير صحيحة، تأكد من البريد وكلمة المرور");
      setLoading(false);
      return;
    }

    const ok = await checkCurrentUserIsAdmin();
    if (!ok) {
      await supabaseExternal.auth.signOut();
      toast.error("هذا الحساب غير مصرح له بالدخول للوحة التحكم");
      setLoading(false);
      return;
    }
    toast.success("تم تسجيل الدخول");
    navigate("/admin-dashboard010", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-slate-100 relative px-4" dir="rtl">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-2xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-xl p-8 space-y-6 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold">دخول لوحة التحكم</h1>
          <p className="text-xs text-slate-400">مخصص للأدمن فقط — وكالة إتقان</p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] text-slate-400 mb-1 block">البريد الإلكتروني</span>
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
              <Mail className="w-4 h-4 text-cyan-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] text-slate-400 mb-1 block">كلمة المرور</span>
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-900/50 px-3">
              <Lock className="w-4 h-4 text-cyan-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none"
              />
            </div>
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} دخول
        </button>
      </form>
    </div>
  );
}
