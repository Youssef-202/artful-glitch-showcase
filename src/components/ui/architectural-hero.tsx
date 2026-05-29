import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ContainerScroll } from "./container-scroll-animation";
import Logo3DCard from "./logo-3d-card";
import { supabase } from "@/integrations/supabase/client";

type HeroMedia = {
  media_type: "image" | "video" | "logo";
  media_url: string;
  text1: string;
  text2: string;
};

const defaults: HeroMedia = {
  media_type: "logo",
  media_url: "",
  text1: "الإتقان ليس مجرد كلمة، بل هو فلسفتنا في كل بكسل، وكل سطر كود، وكل قصة نرويها.",
  text2: "نؤمن أن الفرق بين الجيد والاستثنائي يكمن في التفاصيل التي لا يراها أحد — لكنها تُحسّ.",
};

export default function ArchitecturalHero() {
  const [media, setMedia] = useState<HeroMedia>(defaults);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setMedia({ ...defaults, ...(data.content as HeroMedia) });
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
            <div className="w-full h-full flex flex-col items-center justify-start gap-4 p-6 overflow-y-auto">
              {(media.text1 || media.text2) && (
                <div className="w-full max-w-2xl text-center pt-2 space-y-2">
                  {media.text1 && (
                    <p className="text-foreground/85 text-sm md:text-base lg:text-lg leading-relaxed font-light">
                      {media.text1}
                    </p>
                  )}
                  {media.text2 && (
                    <p className="text-foreground/60 text-xs md:text-sm lg:text-base leading-relaxed font-light">
                      {media.text2}
                    </p>
                  )}
                </div>
              )}
              <div className="flex-1 w-full flex items-center justify-center min-h-0">
                {media.media_type === "image" && media.media_url ? (
                  <img src={media.media_url} alt="" className="max-w-full max-h-full object-contain rounded-2xl" />
                ) : media.media_type === "video" && media.media_url ? (
                  <video src={media.media_url} autoPlay muted loop playsInline className="max-w-full max-h-full object-contain rounded-2xl" />
                ) : (
                  <Logo3DCard className="w-full max-w-lg" />
                )}
              </div>
            </div>
          </ContainerScroll>
        </div>

        <div className="flex flex-col items-center text-center px-4 pb-20 -mt-24 md:-mt-48 relative z-20">
          <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light opacity-90 mb-6">
            في كل تفصيل رقمي
          </h2>

          <p
            className="text-foreground opacity-70 text-base md:text-lg max-w-2xl leading-relaxed mb-10 font-light"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            حيث تلتقي الرؤية بالإبداع. نحن وكالة تصميم تركز على بناء تجارب
            رقمية تترك أثراً، مدمجين الفن بالتكنولوجيا لتحقيق الكمال.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a
              href="/contact"
              className="btn-liquid-glass rounded-full px-8 sm:px-10 py-4 sm:py-5 font-bold text-base sm:text-lg text-foreground cursor-pointer"
            >
              ابدأ مشروعك
            </a>
            <a
              href="/portfolio"
              className="btn-liquid-glass rounded-full px-8 sm:px-10 py-4 sm:py-5 font-medium text-base sm:text-lg text-foreground flex items-center gap-3 cursor-pointer"
            >
              أعمالنا
              <ArrowLeft className="w-5 h-5" />
            </a>
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
