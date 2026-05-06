import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useLang } from "@/i18n/LanguageProvider";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AuthPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({
    email: typeof window !== "undefined" ? localStorage.getItem("etqan_last_email") ?? "" : "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("✓");
        nav("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword(form);
        if (error) throw error;
        localStorage.setItem("etqan_last_email", form.email);
        nav("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-8">
        <h1 className="text-3xl font-black mb-6 text-center">
          <span className="text-gradient">{mode === "signin" ? t.auth.title : t.auth.signupTitle}</span>
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder={t.auth.email}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder={t.auth.password}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 pr-12 outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50"
          >
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setMode((p) => (p === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-primary"
        >
          {mode === "signin" ? t.auth.switchToSignup : t.auth.switchToSignin}
        </button>
      </motion.div>
    </div>
  );
}
