import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ContainerScroll } from "./container-scroll-animation";
import Logo3DCard from "./logo-3d-card";
import { supabase } from "@/integrations/supabase/client";

type HeroMedia = { media_type: "image" | "video" | "logo"; media_url: string };


export default function ArchitecturalHero() {
  const [media, setMedia] = useState<HeroMedia>({ media_type: "logo", media_url: "" });

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setMedia({ media_type: "logo", media_url: "", ...(data.content as HeroMedia) });
      });
  }, []);

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden selection:bg-[#2dd4bf] selection:text-[#0a2e2b]"
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2dd4bf] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#115e59] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #2dd4bf1a 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col overflow-hidden">
        <div className="flex flex-col items-center text-center px-4 pt-24 md:pt-28 pb-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-[#2dd4bf]/30 bg-[#0a2e2b]/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-pulse" />
            <span className="text-[#2dd4bf] text-sm font-medium tracking-wide">
              منذ ٢٠٢٤ — وكالة الإتقان الرقمي
            </span>
          </div>

          <p className="text-[#2dd4bf]/80 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Mastery · إتقان · Precision
          </p>

          <h1 className="text-[#f5f3ee] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">
            نصنع الـ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#2dd4bf] to-[#115e59]">
              إتقان
            </span>
          </h1>

          <p className="text-[#f5f3ee]/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light mb-3">
            الإتقان ليس مجرد كلمة، بل هو فلسفتنا في كل بكسل، وكل سطر كود، وكل قصة نرويها.
          </p>
          <p className="text-[#f5f3ee]/50 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-light mb-8">
            نؤمن أن الفرق بين الجيد والاستثنائي يكمن في التفاصيل التي لا يراها أحد — لكنها تُحسّ.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[#f5f3ee]/60 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf] text-lg font-bold">+٥٠</span>
              <span>مشروع منجز</span>
            </div>
            <div className="w-px h-4 bg-[#2dd4bf]/20" />
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf] text-lg font-bold">٪١٠٠</span>
              <span>التزام بالجودة</span>
            </div>
            <div className="w-px h-4 bg-[#2dd4bf]/20" />
            <div className="flex items-center gap-2">
              <span className="text-[#2dd4bf] text-lg font-bold">٢٤/٧</span>
              <span>دعم متواصل</span>
            </div>
          </div>
        </div>

        <div className="-mt-32 md:-mt-64">
          <ContainerScroll titleComponent={null}>
            <div className="w-full h-full flex items-center justify-center p-6">
              {media.media_type === "image" && media.media_url ? (
                <img src={media.media_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : media.media_type === "video" && media.media_url ? (
                <video src={media.media_url} autoPlay muted loop playsInline className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Logo3DCard className="w-full max-w-lg" />
              )}
            </div>
          </ContainerScroll>
        </div>

        <div className="flex flex-col items-center text-center px-4 pb-20 -mt-24 md:-mt-48 relative z-20">
          <h2 className="text-[#f5f3ee] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light opacity-90 mb-6">
            في كل تفصيل رقمي
          </h2>

          <p
            className="text-[#f5f3ee] opacity-70 text-base md:text-lg max-w-2xl leading-relaxed mb-10 font-light"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            حيث تلتقي الرؤية بالإبداع. نحن وكالة تصميم تركز على بناء تجارب
            رقمية تترك أثراً، مدمجين الفن بالتكنولوجيا لتحقيق الكمال.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a
              href="/contact"
              className="btn-liquid-glass rounded-full px-8 sm:px-10 py-4 sm:py-5 font-bold text-base sm:text-lg text-[#f5f3ee] cursor-pointer"
            >
              ابدأ مشروعك
            </a>
            <a
              href="/portfolio"
              className="btn-liquid-glass rounded-full px-8 sm:px-10 py-4 sm:py-5 font-medium text-base sm:text-lg text-[#f5f3ee] flex items-center gap-3 cursor-pointer"
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
