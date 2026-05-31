import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ContainerScroll } from "./container-scroll-animation";
import Logo3DCard from "./logo-3d-card";
import { supabase } from "@/integrations/supabase/client";

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
        <div className="flex flex-col items-center text-center px-4 pt-24 md:pt-28 pb-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-primary/30 bg-card/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-sm font-medium tracking-wide">
              منذ ٢٠٢٤ — وكالة الإتقان الرقمي
            </span>
          </div>

          <p className="text-primary/80 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Mastery · إتقان · Precision
          </p>

          <h1 className="text-foreground text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">
            نصنع الـ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-accent">
              إتقان
            </span>
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
                  {media.media_type === "image" && media.media_url ? (
                    <img src={media.media_url} alt="" style={mediaStyle} className={`absolute inset-0 w-full h-full ${fitClass}`} />
                  ) : media.media_type === "video" && media.media_url ? (
                    <video src={media.media_url} autoPlay muted loop playsInline style={mediaStyle} className={`absolute inset-0 w-full h-full ${fitClass}`} />
                  ) : (
                    <Logo3DCard className="w-full max-w-lg" />
                  )}




                  {(showText1 || showText2) && (
                    <div
                      className={`absolute ${positionClass} z-10 p-4 md:p-6 pointer-events-none`}
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
                            className={`${sizeClass[media.text2.size]} ${weightClass[media.text2.weight]} ${alignClass[media.text2.align]} leading-relaxed drop-shadow-md max-w-2xl mx-auto`}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl">
            {[
              { value: "+2000", label: "علامة تجارية" },
              { value: "+7000", label: "عميل" },
              { value: "+7", label: "سنوات خبرة" },
              { value: "+70", label: "ادارة الحسابات" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm px-4 py-8 sm:py-12 flex flex-col items-center justify-center gap-3"
              >
                <span className="text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
                  {s.value}
                </span>
                <span className="text-sm sm:text-base text-foreground/70">
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
      `}</style>
    </section>
  );
}
