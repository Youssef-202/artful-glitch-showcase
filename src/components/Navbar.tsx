import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Languages, Menu, X, LogIn, LayoutDashboard, Settings as SettingsIcon, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logo-white.png";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setAvatarUrl(null); return; }
    supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => setAvatarUrl((data as any)?.avatar_url ?? null));
  }, [user]);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/services", label: t.nav.services },
    { to: "/portfolio", label: t.nav.portfolio },
    { to: "/blog", label: t.nav.blog },
    { to: "/about", label: t.nav.about },
    { to: "/contact", label: t.nav.contact },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4"
    >
      <nav className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2" aria-label={t.common.brand}>
          <img src={theme === "dark" ? logoDark : logoLight} alt={t.common.brand} className="h-10 sm:h-12 w-auto object-contain" />
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-foreground/5",
                    isActive && "bg-foreground/10 text-foreground"
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/account"
              aria-label="My account"
              className="glass rounded-full p-1 hover:scale-105 transition flex items-center justify-center overflow-hidden w-10 h-10 border border-border"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>
          ) : (
            <Link
              to="/auth"
              aria-label="Login"
              className="glass rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t.auth.signIn}</span>
            </Link>
          )}

          {user && isAdmin && (
            <Link
              to="/dashboard"
              aria-label="Admin Dashboard"
              className="glass rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition"
              title={t.dashboard.title}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="Settings"
                className="glass rounded-full p-2 hover:scale-105 transition"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 glass-strong border-border p-3 space-y-2 rounded-2xl z-50">
              <p className="text-xs font-bold text-muted-foreground px-2 pb-1">الإعدادات</p>

              <button
                onClick={toggleLang}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition text-sm"
              >
                <span className="flex items-center gap-2">
                  <Languages className="w-4 h-4" /> اللغة
                </span>
                <span className="text-xs font-bold opacity-70">{lang === "ar" ? "عربي → EN" : "EN → عربي"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition text-sm"
              >
                <span className="flex items-center gap-2">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  المظهر
                </span>
                <span className="text-xs font-bold opacity-70">{theme === "dark" ? "فاتح" : "داكن"}</span>
              </button>
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setOpen((p) => !p)}
            aria-label="Menu"
            className="lg:hidden glass rounded-full p-2"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden glass-strong rounded-2xl mt-2 p-2 max-w-7xl mx-auto flex flex-col gap-1"
        >
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium hover:bg-foreground/5",
                    isActive && "bg-foreground/10"
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </motion.ul>
      )}
    </motion.header>
  );
}
