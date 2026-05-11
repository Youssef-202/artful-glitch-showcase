import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";

export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // smooth the progress
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });

  // Compute travel distance dynamically based on number of cards
  const cardCount = items.length;
  const cardW = 380; // base card width incl gap
  const totalWidth = cardCount * cardW;
  const travel = Math.max(0, totalWidth - 800); // estimate viewport width

  const xRange = dir === "rtl" ? [0, travel] : [0, -travel];
  const x = useTransform(smooth, [0.05, 0.95], xRange);

  useMotionValueEvent(smooth, "change", (v) => {
    const idx = Math.min(cardCount - 1, Math.max(0, Math.floor(v * cardCount)));
    setActiveIdx(idx);
  });

  // Section tall enough to allow horizontal travel
  const sectionHeight = `${100 + (cardCount * 40)}vh`;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/4 w-[40rem] h-[40rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* heading */}
        <div className="px-6 sm:px-12 max-w-7xl mx-auto w-full mb-8 sm:mb-12 flex items-end justify-between gap-6 flex-wrap">
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span className="text-gradient">{t.portfolio.title}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground tabular-nums">
              <span className="text-foreground text-2xl">{String(activeIdx + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(cardCount).padStart(2, "0")}</span>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full px-5 sm:px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
            >
              {t.common.viewAll} <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* progress bar */}
        <div className="px-6 sm:px-12 max-w-7xl mx-auto w-full mb-6">
          <div className="h-[3px] w-full bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary-glow rounded-full origin-left"
              style={{ scaleX: smooth }}
            />
          </div>
        </div>

        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-20" />

        {/* horizontal track */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-6 sm:gap-8 px-6 sm:px-20 will-change-transform"
        >
          {items.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              index={i}
              total={cardCount}
              progress={smooth}
              lang={lang}
              dir={dir}
              tCategories={t.portfolio.categories}
              learnMore={t.common.learnMore}
              Arrow={Arrow}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ item, index, total, progress, lang, dir, tCategories, learnMore, Arrow }: any) {
  // Each card highlights when its slot is closest to active
  const slot = (index + 0.5) / total;
  const distance = useTransform(progress, (v: number) => Math.abs(v - slot));
  const scale = useTransform(distance, [0, 0.15, 0.4], [1, 0.96, 0.88]);
  const opacity = useTransform(distance, [0, 0.2, 0.5], [1, 0.85, 0.5]);
  const y = useTransform(distance, [0, 0.4], [0, 30]);
  const rotate = useTransform(distance, [0, 0.4], [0, dir === "rtl" ? -3 : 3]);

  return (
    <motion.div
      style={{ scale, opacity, y, rotate }}
      className="flex-shrink-0 w-[260px] sm:w-[320px] lg:w-[360px]"
    >
      <Link
        to="/portfolio"
        className="group relative block rounded-3xl overflow-hidden glass border border-white/10 hover:shadow-glow transition-shadow duration-500"
      >
        <div
          className="relative aspect-[3/4] overflow-hidden"
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

          {/* index number watermark */}
          <span className="absolute top-4 right-4 text-[80px] leading-none font-black text-foreground/10 select-none">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="absolute top-4 left-4 text-xs px-3 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-wide">
            {tCategories[item.category]}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-lg font-black mb-1 line-clamp-1">
              {lang === "ar" ? item.titleAr : item.titleEn}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
              {lang === "ar" ? item.clientAr : item.clientEn}
            </p>
            <span className="inline-flex items-center gap-1.5 text-primary text-sm font-bold opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              {learnMore} <Arrow className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-primary/0 group-hover:ring-primary/40 transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}
