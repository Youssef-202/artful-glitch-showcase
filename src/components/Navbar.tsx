import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Languages, Menu, X, Settings as SettingsIcon, LogIn, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabaseExternal } from "@/integrations/supabase/external";
import logoMark from "@/assets/etqan-mark.png.asset.json";

const ADMIN_EMAIL = "youssf582022@gmail.com";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabaseExternal.auth.getSession().then(({ data }) => {
      setIsAdmin(data.session?.user?.email === ADMIN_EMAIL);
    });
    const { data: sub } = supabaseExternal.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


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
        "fixed top-0 inset-x-0 z-50 px-4 sm:px-6 transition-all duration-500 ease-out",
        scrolled ? "pt-2" : "pt-4"
      )}
    >
      <motion.nav
        animate={{
          maxWidth: scrolled ? 880 : 1280,
          paddingTop: scrolled ? 6 : 12,
          paddingBottom: scrolled ? 6 : 12,
          borderRadius: scrolled ? 999 : 16,
        }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className={cn(
          "glass-strong px-4 sm:px-6 flex items-center justify-between mx-auto",
          scrolled && "shadow-elegant backdrop-blur-2xl"
        )}
      >
        <Link to="/" className="flex items-center gap-2" aria-label={t.common.brand}>
          <motion.img
            src={logoMark.url}
            alt="وكالة إتقان"
            className={cn(
              "transition-all duration-300",
              theme === "dark" ? "" : "brightness-0 saturate-100"
            )}
            style={{
              height: scrolled ? 28 : 36,
              ...(theme === "light"
                ? { filter: "brightness(0) saturate(100%) invert(28%) sepia(88%) saturate(1652%) hue-rotate(140deg) brightness(94%) contrast(101%)" }
                : {}),
            }}
            style={{ height: scrolled ? 28 : 36 }}
          />
          {!scrolled && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden sm:inline font-extrabold tracking-tight whitespace-nowrap text-foreground text-xl"
            >
              وكالة إتقان
            </motion.span>
          )}
        </Link>

        <ul className="hidden lg:flex items-center gap-1 relative">
          {links.map((l) => (
            <li key={l.to} className="relative">
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "nav-link-glass relative px-4 py-2 text-sm font-semibold block tracking-normal whitespace-nowrap rounded-full",
                    isActive ? "is-active" : "text-foreground/85"
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>



        <div className="flex items-center gap-2">


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
      </motion.nav>

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
