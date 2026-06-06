import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ContainerScroll } from "./container-scroll-animation";
import Logo3DCard from "./logo-3d-card";
import TypewriterLoop from "./TypewriterLoop";
import { supabase } from "@/integrations/supabase/client";

const rotatingWords = ["إتقان", "إبداع", "تميّز", "احتراف", "شغف", "أثر"];
const transitions = [
  // fade + scale
  {
    initial: { opacity: 0, scale: 0.6, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.3, filter: "blur(8px)" },
  },
  // slide up
  {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  },
  // slide from right (RTL natural)
  {
    initial: { opacity: 0, x: -60, rotate: -8 },
    animate: { opacity: 1, x: 0, rotate: 0 },
    exit: { opacity: 0, x: 60, rotate: 8 },
  },
  // flip
  {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
  },
  // skew slide
  {
    initial: { opacity: 0, x: 50, skewX: 12 },
    animate: { opacity: 1, x: 0, skewX: 0 },
    exit: { opacity: 0, x: -50, skewX: -12 },
  },
];

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => p + 1), 2400);
    return () => clearInterval(id);
  }, []);
  const word = rotatingWords[i % rotatingWords.length];
  const tr = transitions[i % transitions.length];
  const longest = "احتراف";
  return (
    <span
      className="relative inline-block align-baseline leading-[1.6]"
      style={{ perspective: 800, minWidth: "fit-content", paddingTop: "0.25em", paddingBottom: "0.1em" }}
    >
      <span className="invisible leading-[1.6]">{longest}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={tr.initial}
          animate={tr.animate}
          exit={tr.exit}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center leading-[1.6] text-transparent bg-clip-text shine-text"
          style={{
            backgroundImage:
              "linear-gradient(110deg, #6ee7b7 0%, #a7f3d0 25%, #ffffff 50%, #a7f3d0 75%, #6ee7b7 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0 0 12px rgba(110, 231, 183, 0.6))",
          }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
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
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value.toLocaleString("en-US")}+</span>;
}


type TextBlock = {
  enabled: boolean;
  value: string;
  color: string;
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  weight: "light" | "normal" | "medium" | "semibold" | "bold";
  align: "right" | "center" | "left";
};

type HeroMedia = {
  media_type: "image" | "video" | "logo";
  media_url: string;
  media_fit: "cover" | "contain";
  media_opacity: number;
  text_position: "top" | "center" | "bottom";
  overlay: "none" | "dark" | "light";
  overlay_opacity: number;
  text1: TextBlock;
  text2: TextBlock;
};

const defaultText1: TextBlock = {
  enabled: true,
  value: "الإتقان ليس مجرد كلمة، بل هو فلسفتنا في كل بكسل، وكل سطر كود، وكل قصة نرويها.",
  color: "#ffffff",
  size: "lg",
  weight: "light",
  align: "center",
};

const defaultText2: TextBlock = {
  enabled: true,
  value: "نؤمن أن الفرق بين الجيد والاستثنائي يكمن في التفاصيل التي لا يراها أحد — لكنها تُحسّ.",
  color: "#ffffffcc",
  size: "md",
  weight: "light",
  align: "center",
};

const defaults: HeroMedia = {
  media_type: "logo",
  media_url: "",
  media_fit: "cover",
  media_opacity: 100,
  text_position: "top",
  overlay: "dark",
  overlay_opacity: 50,
  text1: defaultText1,
  text2: defaultText2,
};

function normalize(raw: any): HeroMedia {
  if (!raw) return defaults;
  const t1 = typeof raw.text1 === "string"
    ? { ...defaultText1, value: raw.text1 }
    : { ...defaultText1, ...(raw.text1 ?? {}) };
  const t2 = typeof raw.text2 === "string"
    ? { ...defaultText2, value: raw.text2 }
    : { ...defaultText2, ...(raw.text2 ?? {}) };
  return { ...defaults, ...raw, text1: t1, text2: t2 };
}

const sizeClass: Record<TextBlock["size"], string> = {
  xs: "text-xs md:text-sm",
  sm: "text-sm md:text-base",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
  "2xl": "text-2xl md:text-3xl",
};
const weightClass: Record<TextBlock["weight"], string> = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};
const alignClass: Record<TextBlock["align"], string> = {
  right: "text-right",
  center: "text-center",
  left: "text-left",
};

export default function ArchitecturalHero() {
  const [media, setMedia] = useState<HeroMedia>(defaults);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => {
        setMedia(normalize(data?.content));
      });
  }, []);

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden selection:bg-primary selection:text-primary-foreground"
    >
      {/* Ambient glow layers */}
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

      <div className="relative z-10 flex flex-col overflow-hidden">
        <div className="flex flex-col items-center text-center px-4 pt-8 md:pt-12 pb-0">
          <div className="mb-6 inline-flex max-w-[95vw] items-center justify-center px-5 sm:px-10 h-14 sm:h-16 md:h-20 rounded-full border border-primary/20 bg-card/30 backdrop-blur-md">
            <span className="typewriter text-foreground/80 font-medium whitespace-nowrap flex items-center gap-1 sm:gap-2 text-[#7ce4e4] min-w-0">
              <span className="text-sm sm:text-2xl md:text-3xl font-bold shrink-0">في إتقان،&nbsp;</span>
              <span className="text-xs sm:text-xl md:text-2xl whitespace-nowrap text-white">
                <TypewriterLoop
                  phrases={[
                    "نحوّل الأفكار إلى تجارب رقمية استثنائية",
                    "نصنع هويات بصرية تترك أثرًا",
                    "نكتب الأكواد كما تُكتب القصائد",
                    "كل تفصيلة تُحسّ قبل أن تُرى",
                  ]}
                />
              </span>
            </span>
          </div>


          <p className="text-primary/80 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Mastery · إتقان · Precision
          </p>

          <h1 className="text-foreground font-extrabold leading-[1.1] mb-6 text-6xl md:text-7xl">
            نصنع الـ{" "}
            <RotatingWord />
          </h1>

          <div className="mb-8" />

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-foreground/60 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg font-bold">+٥٠</span>
              <span>مشروع منجز</span>
            </div>
            <div className="w-px h-4 bg-primary/20" />
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg font-bold">٪١٠٠</span>
              <span>التزام بالجودة</span>
            </div>
            <div className="w-px h-4 bg-primary/20" />
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg font-bold">٢٤/٧</span>
              <span>دعم متواصل</span>
            </div>
          </div>
        </div>

        <div className="-mt-32 md:-mt-64">
          <ContainerScroll titleComponent={null}>
            {(() => {
              const fitClass = media.media_fit === "contain" ? "object-contain" : "object-cover";
              const mediaStyle = { opacity: (media.media_opacity ?? 100) / 100 };
              const positionClass =
                media.text_position === "center"
                  ? "inset-0 flex items-center"
                  : media.text_position === "bottom"
                  ? "inset-x-0 bottom-0"
                  : "inset-x-0 top-0";
              const overlayBg =
                media.overlay === "dark"
                  ? `linear-gradient(to bottom, hsl(var(--background) / ${(media.overlay_opacity ?? 50) / 100}), transparent)`
                  : media.overlay === "light"
                  ? `linear-gradient(to bottom, hsl(0 0% 100% / ${(media.overlay_opacity ?? 50) / 100}), transparent)`
                  : "transparent";
              const hasMediaOverlay = media.media_type !== "logo" && media.overlay !== "none";
              const showText1 = media.text1.enabled && media.text1.value;
              const showText2 = media.text2.enabled && media.text2.value;

              return (
                <div className="relative w-full h-full flex items-center justify-center p-0 overflow-hidden">
                  {media.media_url && (media.media_type === "image" || media.media_type === "video") && (
                    media.media_type === "image" ? (
                      <img src={media.media_url} alt="" style={mediaStyle} className={`absolute inset-0 w-full h-full ${fitClass} z-0`} />
                    ) : (
                      <video src={media.media_url} autoPlay muted loop playsInline style={mediaStyle} className={`absolute inset-0 w-full h-full ${fitClass} z-0`} />
                    )
                  )}

                  {(media.media_type === "logo" || !media.media_url) && (
                    <Logo3DCard className="relative z-10 w-full max-w-lg" />
                  )}


                  {/* CTA buttons inside the hero card (bottom corners) */}
                  <div className="absolute inset-x-0 bottom-4 md:bottom-8 z-30 flex justify-between items-center px-4 md:px-8 pointer-events-none">
                    <a
                      href="/portfolio"
                      className="pointer-events-auto rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-primary-foreground font-medium text-sm sm:text-base btn-liquid-glass"
                    >
                      أعمالنا
                    </a>
                    <a
                      href="/contact"
                      className="pointer-events-auto rounded-full px-5 sm:px-7 py-2.5 sm:py-3 text-primary-foreground font-bold text-sm sm:text-base btn-liquid-glass"
                    >
                      ابدأ مشروعك
                    </a>
                  </div>

                  {(showText1 || showText2) && (
                    <div
                      className={`absolute ${positionClass} z-20 p-4 md:p-6 pointer-events-none`}
                      style={hasMediaOverlay ? { backgroundImage: overlayBg } : undefined}
                    >
                      <div className="w-full flex flex-col items-stretch gap-2">
                        {showText1 && (
                          <p
                            className={`${sizeClass[media.text1.size]} ${weightClass[media.text1.weight]} ${alignClass[media.text1.align]} leading-relaxed drop-shadow-md max-w-2xl mx-auto`}
                            style={{ color: media.text1.color }}
                          >
                            {media.text1.value}
                          </p>
                        )}
                        {showText2 && (
                          <p
                            className={`hidden md:block ${sizeClass[media.text2.size]} ${weightClass[media.text2.weight]} ${alignClass[media.text2.align]} leading-relaxed drop-shadow-md max-w-2xl mx-auto`}
                            style={{ color: media.text2.color }}
                          >
                            {media.text2.value}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </ContainerScroll>
        </div>





        <div className="flex flex-col items-center text-center px-4 pb-20 -mt-24 md:-mt-48 relative z-20">
          <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light opacity-90 mb-10">
            قصص نجاحنا تبدأ من هنا
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 w-full max-w-6xl">
            {[
              { value: 2000, label: "علامة تجارية" },
              { value: 7000, label: "عميل" },
              { value: 7, label: "سنوات خبرة" },
              { value: 70, label: "ادارة الحسابات" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm px-2 py-5 sm:px-4 sm:py-12 flex flex-col items-center justify-center gap-2 sm:gap-3"
              >
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light text-foreground whitespace-nowrap" dir="ltr">
                  <CountUp end={s.value} />
                </span>
                <span className="text-xs sm:text-base text-foreground/70 text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>


      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shine-move {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .shine-text {
          animation: shine-move 3s linear infinite;
        }
      `}</style>
    </section>
  );
}
