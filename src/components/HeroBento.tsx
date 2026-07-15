import { motion } from "framer-motion";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import logoDark from "@/assets/logo.png";
import logo3d from "@/assets/etqan-logo-3d.png";

/**
 * Editorial hero for a design agency — big cinematic typography,
 * centered monogram, soft ambient light, refined motion.
 */
export default function HeroBento() {
  const { t, dir } = useLang();

  return (
    <section
      dir={dir}
      className="relative w-full overflow-hidden min-h-[88vh] flex items-center justify-center px-4 sm:px-8 pt-16 pb-24"
    >
      {/* grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass border border-border/40 px-4 py-1.5 mb-10"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] sm:text-xs tracking-[0.3em] font-bold text-primary">
            CREATIVE STUDIO · 2026
          </span>
        </motion.div>

        {/* Monogram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
          style={{
            filter:
              "drop-shadow(0 0 30px hsl(var(--primary) / 0.55)) drop-shadow(0 0 80px hsl(var(--primary) / 0.25))",
          }}
        >
          <img
            src={logoDark}
            alt={t.common.brand}
            className="block dark:hidden h-28 sm:h-36 lg:h-44 w-auto object-contain"
            draggable={false}
          />
          <img
            src={logo3d}
            alt={t.common.brand}
            className="hidden dark:block h-28 sm:h-36 lg:h-44 w-auto object-contain"
            draggable={false}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-black leading-[1.02] tracking-tight text-5xl sm:text-7xl lg:text-[7.5rem]"
        >
          <span className="block">نصمم</span>
          <span className="block">
            <span className="text-gradient italic font-black">حضوراً</span>{" "}
            يُروى.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 max-w-2xl text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed"
        >
          {t.common.heroSubtitle}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
          >
            {t.common.ctaStart}
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold glass-strong border border-border/40 hover:bg-foreground/5 transition"
          >
            <Play className="w-3.5 h-3.5 text-primary" />
            {t.common.ctaExplore}
          </Link>
        </motion.div>

        {/* Bottom marquee strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl glass border border-border/40"
        >
          {[
            { k: "+120", v: "مشروع منجز" },
            { k: "+45", v: "علامة تجارية" },
            { k: "8", v: "سنوات خبرة" },
            { k: "100%", v: "التزام بالتميّز" },
          ].map((s) => (
            <div
              key={s.v}
              className="bg-background/30 px-4 py-5 text-center"
            >
              <p className="text-2xl sm:text-3xl font-black text-gradient">
                {s.k}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground tracking-wider">
                {s.v}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
