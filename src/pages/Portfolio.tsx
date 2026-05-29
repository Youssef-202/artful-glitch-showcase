import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import type { PortfolioItem } from "@/lib/portfolio";

function TiltCard({
  item,
  index,
  lang,
  categoryLabel,
}: {
  item: PortfolioItem;
  index: number;
  lang: "ar" | "en";
  categoryLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07 }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full rounded-3xl bg-card/60 backdrop-blur-xl border border-border/20 overflow-hidden cursor-pointer"
      >
        <Link to={`/portfolio/${item.id}`} className="block h-full" aria-label={lang === "ar" ? item.titleAr : item.titleEn}>

        {/* Cover */}
        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
        >
          {item.coverUrl && (
            <motion.img
              src={item.coverUrl}
              alt={lang === "ar" ? item.titleAr : item.titleEn}
              loading="lazy"
              style={{ transform: "translateZ(40px)" }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          )}

          {/* Glare */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
            style={{
              background: useTransform(
                [glareX, glareY] as any,
                ([gx, gy]: any) =>
                  `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.45), transparent 55%)`
              ),
            }}
          />


          {/* Floating chip */}
          <motion.span
            style={{ transform: "translateZ(60px)" }}
            className="absolute top-4 left-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full bg-background/70 backdrop-blur text-primary font-bold border border-primary/20"
          >
            <Sparkles className="w-3 h-3" /> {categoryLabel}
          </motion.span>

          {/* Floating arrow on hover */}
          <motion.div
            style={{ transform: "translateZ(80px)" }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 group-hover:rotate-0 -rotate-45 transition-all duration-500"
          >
            <ArrowUpRight className="w-5 h-5" />
          </motion.div>

          {/* Title floats up on hover */}
          <motion.div
            style={{ transform: "translateZ(70px)" }}
            className="absolute bottom-0 inset-x-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
          >
            <h3 className="text-lg font-black text-white line-clamp-1">
              {lang === "ar" ? item.titleAr : item.titleEn}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
              {lang === "ar" ? item.clientAr : item.clientEn}
            </p>
          </motion.div>
        </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function Portfolio() {
  const { t, lang } = useLang();
  const { items: portfolioItems } = usePortfolio();
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? portfolioItems : portfolioItems.filter((p) => p.category === filter)),
    [filter, portfolioItems]
  );

  const cats = [
    { id: "all", label: t.portfolio.categories.all },
    { id: "branding", label: t.portfolio.categories.branding },
    { id: "web", label: t.portfolio.categories.web },
    { id: "design", label: t.portfolio.categories.design },
    { id: "photo", label: t.portfolio.categories.photo },
  ];

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <p className="text-sm text-primary tracking-widest mb-3">{t.portfolio.kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{t.portfolio.title}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.portfolio.subtitle}</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === c.id
                ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground"
                : "bg-card/60 backdrop-blur-xl border border-border/20 hover:bg-foreground/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3D tilt grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filtered.map((item, i) => (
          <TiltCard
            key={item.id}
            item={item}
            index={i}
            lang={lang}
            categoryLabel={t.portfolio.categories[item.category]}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-16">—</p>
        )}
      </div>
    </div>
  );
}
