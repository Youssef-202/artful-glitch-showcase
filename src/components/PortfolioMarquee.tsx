import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { ArrowLeft, ArrowRight, Move, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

/**
 * Infinite pannable canvas: cards scattered across a 2D plane.
 * User drags to navigate freely (like Figma). Cards have parallax depth,
 * scale based on viewport-center proximity, and a focused card auto-centers on click.
 */
export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const viewportRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(600);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });

  useEffect(() => {
    const update = () => {
      if (!viewportRef.current) return;
      setVw(viewportRef.current.clientWidth);
      setVh(viewportRef.current.clientHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Scatter cards on a quasi-random but stable grid in world space
  const positions = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(items.length || 1));
    const cellW = 360;
    const cellH = 440;
    return items.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // deterministic jitter
      const jx = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 80;
      const jy = ((Math.cos(i * 78.233) * 12345.6789) % 1) * 80;
      const depth = ((Math.sin(i * 3.7) + 1) / 2) * 0.5 + 0.6; // 0.6 - 1.1
      return {
        wx: (col - cols / 2) * cellW + jx,
        wy: (row - cols / 2) * cellH + jy,
        depth,
        rot: ((Math.sin(i * 2.3) * 12)),
      };
    });
  }, [items]);

  // Center on a card
  const focusCard = (i: number) => {
    const p = positions[i];
    if (!p) return;
    animate(x, -p.wx * p.depth, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    animate(y, -p.wy * p.depth, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
  };

  // Auto pan slowly when idle
  useEffect(() => {
    let raf = 0;
    let t0 = performance.now();
    let lastInteract = performance.now();
    const onAny = () => { lastInteract = performance.now(); };
    window.addEventListener("pointerdown", onAny);
    const tick = (now: number) => {
      const dt = (now - t0) / 1000; t0 = now;
      if (now - lastInteract > 2500) {
        x.set(x.get() + Math.sin(now / 4000) * 8 * dt);
        y.set(y.get() + Math.cos(now / 5000) * 6 * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointerdown", onAny); };
  }, [x, y]);

  return (
    <section className="relative py-24">
      {/* heading */}
      <div className="px-6 sm:px-12 max-w-7xl mx-auto mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient">{t.portfolio.title}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm sm:text-base flex items-center gap-2">
            <Move className="w-4 h-4" /> {dir === "rtl" ? "اسحب الكانفس لاستكشاف الأعمال" : "Drag the canvas to explore"}
          </p>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </div>

      {/* viewport */}
      <div
        ref={viewportRef}
        className="relative mx-4 sm:mx-8 rounded-3xl overflow-hidden glass border border-white/10 cursor-grab active:cursor-grabbing"
        style={{ height: "70vh", minHeight: 480 }}
      >
        {/* grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* radial vignette */}
        <div className="pointer-events-none absolute inset-0 bg-radial-primary" />

        {/* draggable plane */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          drag
          dragMomentum
          dragTransition={{ power: 0.3, timeConstant: 400 }}
          style={{ x: sx, y: sy }}
          onDrag={(_, info) => {
            x.set(x.get() + info.delta.x);
            y.set(y.get() + info.delta.y);
          }}
        >
          {items.map((item, i) => {
            const p = positions[i];
            return (
              <CanvasCard
                key={item.id}
                item={item}
                index={i}
                px={p.wx}
                py={p.wy}
                depth={p.depth}
                rot={p.rot}
                sx={sx}
                sy={sy}
                vw={vw}
                vh={vh}
                lang={lang}
                onFocus={() => focusCard(i)}
                tCategories={t.portfolio.categories}
                Arrow={Arrow}
                learnMore={t.common.learnMore}
              />
            );
          })}
        </motion.div>

        {/* center crosshair indicator */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary/60 shadow-glow" />
        </div>

        {/* mini-map */}
        <div className="absolute bottom-4 right-4 glass rounded-xl p-2 border border-white/10">
          <div className="relative w-28 h-20 rounded-md overflow-hidden bg-background/40">
            {items.map((it, i) => {
              const p = positions[i];
              const mx = 50 + (p.wx / 1600) * 50;
              const my = 50 + (p.wy / 1600) * 50;
              return (
                <button
                  key={it.id}
                  onClick={() => focusCard(i)}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary hover:bg-accent hover:scale-150 transition-transform"
                  style={{ left: `${mx}%`, top: `${my}%`, transform: "translate(-50%,-50%)" }}
                  aria-label={`focus ${i}`}
                />
              );
            })}
            {/* viewport indicator */}
            <ViewportIndicator sx={sx} sy={sy} />
          </div>
          <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
            <Maximize2 className="w-3 h-3" /> {items.length}
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewportIndicator({ sx, sy }: any) {
  const left = useTransform(sx, (v: number) => `${50 - (v / 1600) * 50}%`);
  const top = useTransform(sy, (v: number) => `${50 - (v / 1600) * 50}%`);
  return (
    <motion.div
      className="absolute w-8 h-6 border border-primary rounded-sm pointer-events-none"
      style={{ left, top, transform: "translate(-50%,-50%)" }}
    />
  );
}

function CanvasCard({ item, index, px, py, depth, rot, sx, sy, vw, vh, lang, onFocus, tCategories, Arrow, learnMore }: any) {
  // distance from viewport center (0,0) in world space after pan
  const dist = useTransform([sx, sy] as any, ([cx, cy]: any) => {
    const dx = px * depth + cx;
    const dy = py * depth + cy;
    return Math.hypot(dx, dy);
  });
  const scale = useTransform(dist, [0, 300, 800], [1.08, 1, 0.85]);
  const opacity = useTransform(dist, [0, 400, 1200], [1, 0.95, 0.4]);
  const blur = useTransform(dist, [0, 500, 1200], [0, 0, 4]);
  const filter = useTransform(blur, (b: number) => `blur(${b}px)`);

  return (
    <motion.button
      onClick={onFocus}
      className="absolute origin-center group"
      style={{
        x: px * depth,
        y: py * depth,
        scale,
        opacity,
        filter,
        rotate: rot,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative w-[240px] sm:w-[280px] rounded-2xl overflow-hidden glass border border-white/10 shadow-elegant hover:shadow-glow transition-shadow duration-500">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-wider">
            {tCategories[item.category]}
          </span>
          <span className="absolute top-3 right-3 text-xs font-black text-foreground/40 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4 text-left">
            <h3 className="text-base font-black mb-0.5 line-clamp-1">
              {lang === "ar" ? item.titleAr : item.titleEn}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {lang === "ar" ? item.clientAr : item.clientEn}
            </p>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
