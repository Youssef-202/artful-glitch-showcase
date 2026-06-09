import { useState, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Eye, EyeOff, Home } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/auth/AuthProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logo-white.png";
import logo3d from "@/assets/etqan-logo-3d.png";

function LogoMesh() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    texture.anisotropy = 16;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [texture]);

  const aspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
  const w = 3.6;
  const h = w / aspect;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const targetY = mouse.current.x * 0.8;
    const targetX = -mouse.current.y * 0.5;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={groupRef}>
        <mesh position={[0, 0, -0.05]} scale={1.18}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent opacity={0.35} color="#5fd9cf" depthWrite={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            side={THREE.DoubleSide}
            metalness={0.6}
            roughness={0.25}
            emissive={new THREE.Color("#5fd9cf")}
            emissiveMap={texture}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export default function AuthPage() {
  const { t } = useLang();
  const { theme } = useTheme();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/account" replace />;

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
          options: { emailRedirectTo: `${window.location.origin}/account` },
        });
        if (error) throw error;
        toast.success("✓");
        nav("/account");
      } else {
        const { error } = await supabase.auth.signInWithPassword(form);
        if (error) throw error;
        localStorage.setItem("etqan_last_email", form.email);
        nav("/account");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/account",
    });
    if (result.error) {
      toast.error((result.error as any)?.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    nav("/account");
  };

  const logoSrc = theme === "dark" ? logoDark : logoLight;

  return (
    <div className="min-h-[calc(100vh-6rem)] w-full grid lg:grid-cols-2 gap-0 px-4 sm:px-6">
      {/* Left: form */}
      <div className="flex items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <img src={logoSrc} alt={t.common.brand} className="h-14 w-auto object-contain" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-center leading-tight">
            <span className="text-gradient">
              {mode === "signin" ? t.auth.title : t.auth.signupTitle}
            </span>
          </h1>
          <p className="text-center text-sm text-muted-foreground mt-2 mb-8">
            ادخل إلى حسابك وتابع رحلتك معنا
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2 px-1">
                {t.auth.email}
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2 px-1">
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-2xl px-4 py-3 pr-12 outline-none focus:border-primary transition"
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
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50"
            >
              {mode === "signin" ? t.auth.signIn : t.auth.signUp}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">أو تابع باستخدام</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className="w-full rounded-2xl px-6 py-3 font-bold bg-background border border-border hover:bg-foreground/5 transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            الدخول باستخدام Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "جديد على المنصة؟ " : "لديك حساب بالفعل؟ "}
            <button
              type="button"
              onClick={() => setMode((p) => (p === "signin" ? "signup" : "signin"))}
              className="text-primary hover:underline font-bold"
            >
              {mode === "signin" ? t.auth.switchToSignup : t.auth.switchToSignin}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right: hero panel */}
      <div className="hidden lg:flex items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-full max-h-[640px] rounded-3xl overflow-hidden glass-strong border border-border/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center">
            <div className="relative w-full flex-1 min-h-[280px] sm:min-h-[360px]">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
                <ambientLight intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={1.2} color="#5fd9cf" />
                <Sparkles count={60} scale={6} size={2} speed={0.4} color="#5fd9cf" />
                <LogoMesh />
              </Canvas>
            </div>
            <h2 className="text-4xl font-black mb-3 mt-4">
              <span className="text-gradient">{t.common.brand}</span>
            </h2>
            <p className="text-muted-foreground max-w-sm">
              نصمم تجارب رقمية استثنائية تحوّل أفكارك إلى واقع ملموس
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
