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
import logoMark from "@/assets/etqan-mark.png.asset.json";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t.common.brand}>
          <img
            src={logoMark.url}
            alt="وكالة إتقان"
            className={cn("h-9 w-auto transition", theme === "dark" ? "" : "invert")}
          />
          <span className="hidden sm:inline font-extrabold tracking-tight whitespace-nowrap text-foreground text-xl">
            وكالة إتقان
          </span>
        </Link>

        {/* Centered text links */}
        <ul className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative text-[15px] font-semibold transition-colors whitespace-nowrap",
                    "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-primary after:transition-all",
                    isActive
                      ? "text-foreground after:w-full"
                      : "text-foreground/70 hover:text-foreground after:w-0 hover:after:w-full"
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Link
              to="/account"
              aria-label="My account"
              className="rounded-full p-1 hover:scale-105 transition flex items-center justify-center overflow-hidden w-10 h-10 border border-border bg-background/50"
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
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition shadow-elegant"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t.auth.signIn}</span>
            </Link>
          )}

          {user && isAdmin && (
            <Link
              to="/dashboard"
              aria-label="Admin Dashboard"
              title={t.dashboard.title}
              className="rounded-full p-2.5 hover:bg-foreground/5 transition text-foreground/80 hover:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="Settings"
                className="rounded-full p-2.5 hover:bg-foreground/5 transition text-foreground/80 hover:text-foreground"
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
            className="lg:hidden rounded-full p-2.5 hover:bg-foreground/5 transition"
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
          className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border mx-0 p-2 flex flex-col gap-1"
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
