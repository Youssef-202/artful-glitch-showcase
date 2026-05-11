import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Languages, Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/auth/AuthProvider";
import { cn } from "@/lib/utils";
import logoLight from "@/assets/logo.png";
import logoDark from "@/assets/logo-white.png";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLang();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

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
          <Link
            to={user ? "/dashboard" : "/auth"}
            aria-label={user ? "Dashboard" : "Login"}
            className="glass rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition"
          >
            {user ? <LayoutDashboard className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span className="hidden sm:inline">{user ? (isAdmin ? t.dashboard.title : t.auth.logout) : t.auth.signIn}</span>
          </Link>
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            className="glass rounded-full px-3 py-2 text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === "ar" ? "EN" : "AR"}</span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="glass rounded-full p-2 hover:scale-105 transition"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
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
