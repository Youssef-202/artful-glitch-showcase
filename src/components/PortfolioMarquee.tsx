import { Link } from "react-router-dom";
import { motion, useMotionValue, animate } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const [bounds, setBounds] = useState(0);

  // duplicate for seamless loop
  const list = items.length ? [...items, ...items] : [];

  useEffect(() => {
    if (!trackRef.current || list.length === 0) return;
    const update = () => {
      const w = trackRef.current!.scrollWidth / 2;
      setBounds(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [list.length]);

  useEffect(() => {
    if (!bounds || paused) return;
    const current = x.get();
    const direction = dir === "rtl" ? 1 : -1;
    const distance = direction === -1 ? -bounds : bounds;
    const remaining = Math.abs(distance - current);
    const speed = 40; // px/sec
    const duration = remaining / speed;
    const controls = animate(x, distance, {
      duration,
      ease: "linear",
      onComplete: () => x.set(0),
    });
    return () => controls.stop();
  }, [bounds, paused, dir, x]);

  const nudge = (delta: number) => {
    const next = x.get() + delta;
    animate(x, next, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
  };

  return (
    <section
      className="relative py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* heading */}
      <div className="px-6 max-w-7xl mx-auto mb-12 flex items-end justify-between gap-6 flex-wrap">
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight">
            <span className="text-gradient">{t.portfolio.title}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl">{t.portfolio.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="prev"
            onClick={() => nudge(320)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:shadow-glow hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            aria-label="next"
            onClick={() => nudge(-320)}
            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:shadow-glow hover:scale-110 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link
            to="/portfolio"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
          >
            {t.common.viewAll} <Arrow className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      {/* track */}
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: -bounds * 1.5, right: bounds * 0.5 }}
        onDragStart={() => setPaused(true)}
      >
        {list.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            to="/portfolio"
            className="group relative flex-shrink-0 w-[280px] sm:w-[340px] rounded-3xl overflow-hidden glass border border-white/10 hover:shadow-glow transition-all duration-500"
            draggable={false}
          >
            <div
              className="relative aspect-[4/5] overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
            >
              {item.coverUrl && (
                <img
                  src={item.coverUrl}
                  alt={lang === "ar" ? item.titleAr : item.titleEn}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <span className="absolute top-4 left-4 text-xs px-3 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-wide">
                {t.portfolio.categories[item.category]}
              </span>
              {/* bottom info */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-lg font-black mb-1 line-clamp-1">
                  {lang === "ar" ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                  {lang === "ar" ? item.clientAr : item.clientEn}
                </p>
                <span className="inline-flex items-center gap-1.5 text-primary text-sm font-bold opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {t.common.learnMore} <Arrow className="w-3.5 h-3.5" />
                </span>
              </div>
              {/* hover ring */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-primary/0 group-hover:ring-primary/40 transition-all duration-500" />
            </div>
          </Link>
        ))}
      </motion.div>

      <div className="text-center mt-12 sm:hidden px-6">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
