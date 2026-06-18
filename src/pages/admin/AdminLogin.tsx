import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseExternal } from "@/integrations/supabase/external";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";

export const ADMIN_EMAIL = "youssf582022@gmail.com";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabaseExternal.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === ADMIN_EMAIL) navigate("/admin-dashboard", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabaseExternal.auth.signInWithPassword({ email, password });
    if (error) {
      // Try sign-up bootstrap if first time and using the admin email
      if (email === ADMIN_EMAIL) {
        const { error: suErr } = await supabaseExternal.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin-dashboard` },
        });
        if (!suErr) {
          const { data: d2, error: e2 } = await supabaseExternal.auth.signInWithPassword({ email, password });
          if (!e2 && d2.session) {
            toast.success("تم تسجيل الدخول");
            navigate("/admin-dashboard", { replace: true });
            setLoading(false);
            return;
          }
        }
      }
      toast.error(error.message || "فشل تسجيل الدخول");
      setLoading(false);
      return;
    }
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabaseExternal.auth.signOut();
      toast.error("هذا الحساب غير مصرح له بالدخول");
      setLoading(false);
      return;
    }
    toast.success("تم تسجيل الدخول");
    navigate("/admin-dashboard", { replace: true });
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
                dir="ltr"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-600"
                placeholder="admin@email.com"
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
                dir="ltr"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          دخول
        </button>

        <p className="text-[10px] text-slate-500 text-center">
          محمي بـ Supabase Auth — جلسة الدخول تُحفظ في المتصفح
        </p>
      </form>
    </div>
  );
}
