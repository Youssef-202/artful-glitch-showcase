import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

/**
 * Elegant portfolio showcase: a refined coverflow with a large feature image,
 * adjacent peeking cards, and a clean caption + thumbnail rail. No gimmicks.
 */
export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const navigate = useNavigate();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const next = useCallback(() => setActive((i) => (i + 1) % Math.max(count, 1)), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % Math.max(count, 1)), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, count]);

  // Horizontal wheel + drag swipe — does NOT hijack vertical page scroll
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(0);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // only react to horizontal intent (trackpad swipe / shift+wheel)
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 350) return;
      wheelLock.current = now;
      const forward = e.deltaX > 0;
      (dir === "rtl" ? !forward : forward) ? next() : prev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev, dir]);

  if (!count) return null;
  const current = items[active];

  // Slots: -2, -1, 0, 1, 2 around active
  const slots = [-2, -1, 0, 1, 2];
  const getItem = (offset: number) => items[(active + offset + count * 10) % count];

  return (
    <section
      className="relative py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-40" />
      <motion.div
        key={`bg-${active}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(800px 400px at 50% 30%, ${current.color}40, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative px-6 sm:px-12 max-w-7xl mx-auto mb-14 flex items-end justify-between gap-6 flex-wrap">
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient font-sans font-extrabold">{t.portfolio.title}</span>
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </div>

      {/* Coverflow stage */}
      <motion.div
        ref={stageRef}
        className="relative h-[460px] sm:h-[540px] flex items-center justify-center touch-pan-y select-none cursor-grab active:cursor-grabbing"
        style={{ perspective: "1600px" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) < 60) return;
          const forward = info.offset.x < 0;
          (dir === "rtl" ? !forward : forward) ? next() : prev();
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
          {slots.map((offset) => {
            const item = getItem(offset);
            const abs = Math.abs(offset);
            const sign = Math.sign(offset) * (dir === "rtl" ? -1 : 1);
            const x = sign * (abs === 1 ? 280 : abs === 2 ? 500 : 0);
            const z = -abs * 120;
            const rotateY = -sign * abs * 18;
            const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.66;
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.7 : 0.35;
            const isActive = offset === 0;

            return (
              <motion.button
                key={`${item.id}-${offset}`}
                onClick={() => {
                  if (offset === 0) {
                    navigate(`/portfolio/${item.id}`);
                    return;
                  }
                  setActive((a) => (a + offset + count) % count);
                }}
                className="absolute pointer-events-auto"
                style={{ transformStyle: "preserve-3d", zIndex: 100 - abs }}
                animate={{ x, z, rotateY, scale, opacity }}
                transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.5 }}
                aria-label={lang === "ar" ? item.titleAr : item.titleEn}
              >
                <motion.div
                  className="relative w-[300px] sm:w-[380px] aspect-[4/5] rounded-3xl overflow-hidden border transition-shadow"
                  style={{
                    transformStyle: "preserve-3d",
                    background: `linear-gradient(135deg, ${item.color}, ${item.accent})`,
                  }}
                  whileHover={{
                    rotateX: -3,
                    rotateY: dir === "rtl" ? -4 : 4,
                    z: 60,
                    scale: 1.03,
                    transition: { duration: 0.35, ease: "easeOut" },
                  }}
                >
                  {/* Hover glow ring */}
                  <div
                    className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.accent})`,
                      filter: "blur(20px)",
                      opacity: 0,
                      transition: "opacity 0.4s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.opacity = "0.5";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.opacity = "0";
                    }}
                  />

                  <div
                    className={`relative w-full h-full rounded-3xl overflow-hidden ${
                      isActive
                        ? "border border-primary/40 shadow-glow"
                        : "border border-white/10 shadow-elegant"
                    }`}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-[0.2em] uppercase">
                        {t.portfolio.categories[item.category]}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-left rtl:text-right">
                        <h3 className="text-xl sm:text-2xl font-black mb-1 leading-tight">
                          {lang === "ar" ? item.titleAr : item.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {lang === "ar" ? item.clientAr : item.clientEn}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

      </motion.div>

      {/* Counter + progress */}
      <div className="relative max-w-3xl mx-auto px-6 mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground tabular-nums"
          >
            <span className="text-foreground font-black text-lg">{String(active + 1).padStart(2, "0")}</span>
            <span className="h-px w-16 bg-foreground/20" />
            <span>{String(count).padStart(2, "0")}</span>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-10 bg-primary shadow-glow" : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
