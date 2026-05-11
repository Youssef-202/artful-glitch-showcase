import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

/**
 * Coverflow-style 3D portfolio showcase.
 * Active card is centered & large; neighbors fan out on sides with depth & rotation.
 * Auto-advances; click sides or use arrows to navigate.
 */
export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = items.length;
  const next = useCallback(() => setActive((i) => (i + 1) % Math.max(count, 1)), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % Math.max(count, 1)), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(next, 4200);
    return () => clearInterval(id);
  }, [paused, next, count]);

  if (!count) return null;
  const current = items[active];

  return (
    <section
      className="relative py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-60" />
      <motion.div
        key={`bg-${active}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(900px 500px at 50% 50%, ${current.color}55, transparent 60%)`,
        }}
      />

      {/* heading */}
      <div className="relative px-6 sm:px-12 max-w-7xl mx-auto mb-12 flex items-end justify-between gap-6 flex-wrap">
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient">{t.portfolio.title}</span>
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </div>

      {/* coverflow stage */}
      <div
        className="relative h-[560px] sm:h-[620px] [perspective:1800px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {items.map((item, i) => {
            // signed offset accounting for wrap-around shortest path
            let off = i - active;
            if (off > count / 2) off -= count;
            if (off < -count / 2) off += count;
            const abs = Math.abs(off);
            if (abs > 3) return null; // only render nearby for perf

            const sign = off === 0 ? 0 : off > 0 ? 1 : -1;
            const rtlMul = dir === "rtl" ? -1 : 1;
            const xPct = off * 22 * rtlMul; // % of stage width
            const rotateY = -sign * Math.min(abs, 3) * 28 * rtlMul;
            const z = -abs * 180;
            const scale = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0.45;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(i)}
                className="absolute top-1/2 left-1/2 origin-center"
                style={{ transformStyle: "preserve-3d" }}
                animate={{
                  x: `calc(-50% + ${xPct}%)`,
                  y: "-50%",
                  rotateY,
                  z,
                  scale,
                  opacity,
                  zIndex: 100 - abs,
                }}
                transition={{ type: "spring", stiffness: 110, damping: 20, mass: 0.7 }}
                aria-label={lang === "ar" ? item.titleAr : item.titleEn}
              >
                <div
                  className="relative w-[280px] sm:w-[360px] aspect-[3/4] rounded-3xl overflow-hidden glass border border-white/10 shadow-elegant"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
                >
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={lang === "ar" ? item.titleAr : item.titleEn}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* shine */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(115deg, transparent 30%, hsl(0 0% 100% / 0.18) 50%, transparent 70%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                  <span className="absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-wider">
                    {t.portfolio.categories[item.category]}
                  </span>
                  <span className="absolute top-4 right-4 text-xs font-black text-foreground/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* reflection */}
                  <div
                    className="pointer-events-none absolute -bottom-1/2 left-0 right-0 h-1/2 opacity-30"
                    style={{
                      background: `linear-gradient(to bottom, ${item.color}, transparent)`,
                      transform: "scaleY(-1)",
                      filter: "blur(8px)",
                    }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* nav arrows */}
        <button
          onClick={prev}
          className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 z-[200] glass rounded-full p-3 hover:scale-110 transition border border-white/10"
          aria-label="prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-[200] glass rounded-full p-3 hover:scale-110 transition border border-white/10"
          aria-label="next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* meta + progress */}
      <div className="relative max-w-3xl mx-auto px-6 mt-10 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45 }}
          >
            <h3 className="text-2xl sm:text-3xl font-black mb-2">
              {lang === "ar" ? current.titleAr : current.titleEn}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? current.clientAr : current.clientEn}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-primary shadow-glow" : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
