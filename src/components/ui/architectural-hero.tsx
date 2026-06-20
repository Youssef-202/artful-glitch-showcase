import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo3DCard from "./logo-3d-card";
import { supabase } from "@/integrations/supabase/external";
import cityBg from "@/assets/futuristic-city-bg.jpg";

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(end * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{value.toLocaleString("en-US")}+</span>;
}

type HeroContent = {
  eyebrow: string;
  headlines: string[];
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  card_title: string;
  card_subtitle: string;
};

const defaults: HeroContent = {
  eyebrow: "PRECISION · إتقان · MASTERY",
  headlines: [
    "نصنع الـاحتراف.",
    "نصنع الـإبداع.",
    "نصنع الـتميّز.",
    "نصنع الـأثر.",
  ],
  cta_primary_label: "ابدأ مشروعك",
  cta_primary_href: "/contact",
  cta_secondary_label: "أعمالنا",
  cta_secondary_href: "/portfolio",
  card_title: "وكالة إتقان",
  card_subtitle: "للخدمات التسويقية",
};

function normalize(raw: any): HeroContent {
  if (!raw) return defaults;
  return {
    ...defaults,
    ...raw,
    headlines: Array.isArray(raw.headlines) && raw.headlines.length > 0 ? raw.headlines : defaults.headlines,
  };
}

function StaticHeadline({ text }: { text: string }) {
  return (
    <div className="relative w-full flex items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-foreground leading-[1] text-center tracking-tight"
        style={{
          fontFamily: '"Amiri", "Instrument Serif", serif',
          fontSize: "clamp(2.6rem, 10vw, 8rem)",
          fontWeight: 700,
          textShadow: "0 0 60px hsl(var(--primary) / 0.25)",
        }}
      >
        {text}
      </motion.h1>
    </div>
  );
}


export default function ArchitecturalHero() {
  const [content, setContent] = useState<HeroContent>(defaults);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => setContent(normalize(data?.content)));
  }, []);

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden selection:bg-primary selection:text-primary-foreground pt-12 md:pt-20 pb-24"
    >
      {/* Ambient glow layers — kept from current site */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent rounded-full blur-[100px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 flex flex-col items-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-foreground/80 text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.45em] uppercase mb-7 md:mb-10"
        >
          {content.eyebrow}
        </motion.p>

        {/* Editorial static headline (replaces "Browse everything.") */}
        <StaticHeadline text={content.headlines[0]} />

        {/* Device-style hero card — phone shape on mobile, wide tablet on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative w-full mt-10 md:mt-14 flex justify-center"
        >
          {/* Soft sage backplate — sits behind lower half of device, wider than it, extending below */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[42%] sm:top-[55%] md:top-[60%] bottom-[-3rem] sm:bottom-[-4rem] md:bottom-[-5rem] mx-auto rounded-[2rem] md:rounded-[2.5rem] -z-10"
            style={{
              width: "min(112%, 100vw)",
              marginLeft: "auto",
              marginRight: "auto",
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(160deg, hsl(var(--primary) / 0.22), hsl(var(--accent) / 0.12) 60%, hsl(var(--primary) / 0.08))",
              boxShadow: "0 80px 120px -40px hsl(var(--primary) / 0.35)",
            }}
          />

          {/* The "device" frame — phone on mobile, wide tablet/laptop on desktop */}
          <div
            className="relative mx-auto w-[78%] xs:w-[72%] sm:w-full sm:max-w-6xl rounded-[2.5rem] sm:rounded-[1.75rem] md:rounded-[2rem] border border-foreground/10 bg-[#cfd3d8]/40 p-[6px] sm:p-2 md:p-2.5 backdrop-blur-xl"
            style={{
              boxShadow:
                "0 30px 60px -30px hsl(var(--primary) / 0.4), 0 60px 120px -60px hsl(220 60% 5% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.22)",
            }}
          >
            <div className="relative aspect-[9/18] sm:aspect-[16/10] w-full overflow-hidden rounded-[2.1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] bg-[#0a1a18]">


              <img
                src={cityBg}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
              <div
                className="absolute inset-0 opacity-50 mix-blend-screen pointer-events-none"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 30%, hsl(var(--primary) / 0.35), transparent 70%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                  maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                }}
              />

              {/* Center: brand card + logo */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 sm:px-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.4 }}
                  className="rounded-2xl px-6 sm:px-10 py-3 sm:py-4 mb-4 sm:mb-6 backdrop-blur-md border border-foreground/15"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.08))",
                    boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.4)",
                  }}
                >
                  <p className="text-white text-lg sm:text-2xl font-bold text-center leading-tight">
                    {content.card_title}
                  </p>
                  <p className="text-white/70 text-[11px] sm:text-sm text-center mt-0.5">
                    {content.card_subtitle}
                  </p>
                </motion.div>

                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <Logo3DCard className="w-full" />
                </div>
              </div>

              {/* Bottom-corner CTAs (same as before, kept) */}
              <div className="absolute inset-x-0 bottom-3 sm:bottom-5 md:bottom-7 z-20 flex justify-between items-center px-3 sm:px-6 md:px-8 pointer-events-none">
                <a
                  href={content.cta_secondary_href}
                  className="pointer-events-auto rounded-full px-4 sm:px-7 py-2 sm:py-3 text-primary-foreground font-medium text-xs sm:text-base btn-liquid-glass"
                >
                  {content.cta_secondary_label}
                </a>
                <a
                  href={content.cta_primary_href}
                  className="pointer-events-auto rounded-full px-4 sm:px-7 py-2 sm:py-3 text-primary-foreground font-bold text-xs sm:text-base btn-liquid-glass"
                >
                  {content.cta_primary_label}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid — kept */}
        <div className="w-full mt-20 md:mt-28">
          <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light opacity-90 mb-8 md:mb-10 text-center">
            قصص نجاحنا تبدأ من هنا
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              { value: 2000, label: "علامة تجارية" },
              { value: 7000, label: "عميل" },
              { value: 7, label: "سنوات خبرة" },
              { value: 70, label: "ادارة الحسابات" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm px-2 py-5 sm:px-4 sm:py-10 flex flex-col items-center justify-center gap-2 sm:gap-3"
              >
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-foreground whitespace-nowrap" dir="ltr">
                  <CountUp end={s.value} />
                </span>
                <span className="text-xs sm:text-base text-foreground/70 text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
