import { ArrowLeft } from "lucide-react";
import Logo3DCard from "./logo-3d-card";

export default function ArchitecturalHero() {


  return (
    <section
      dir="rtl"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden selection:bg-[#2dd4bf] selection:text-[#0a2e2b]"
    >
      {/* Ambient glow layers (over the persistent canvas) */}
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

      <div className="relative z-10 max-w-7xl w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16 items-center">
        {/* Content — 60% */}
        <div className="lg:col-span-6 flex flex-col items-start text-right">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#2dd4bf]/30 bg-[#115e59]/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2dd4bf]" />
            </span>
            <span
              className="text-[#2dd4bf] text-xs sm:text-sm font-medium tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Agency of Mastery
            </span>
          </div>

          <h1 className="text-[#f5f3ee] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8">
            نصنع الـ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#2dd4bf] to-[#115e59]">
              إتقان
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl font-light opacity-90">
              في كل تفصيل رقمي
            </span>
          </h1>

          <p
            className="text-[#f5f3ee] opacity-70 text-base md:text-xl max-w-2xl leading-relaxed mb-12 font-light"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            حيث تلتقي الرؤية بالإبداع. نحن وكالة تصميم تركز على بناء تجارب
            رقمية تترك أثراً، مدمجين الفن بالتكنولوجيا لتحقيق الكمال.
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6">
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

        {/* Visual — 40% */}
        <Logo3DCard className="lg:col-span-4" />

      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40">
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#2dd4bf] to-transparent" />
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
