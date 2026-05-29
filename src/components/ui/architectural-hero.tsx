import { ArrowLeft } from "lucide-react";
import { ContainerScroll } from "./container-scroll-animation";
import Logo3DCard from "./logo-3d-card";

export default function ArchitecturalHero() {
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
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center text-center px-4">
              <h1 className="text-[#f5f3ee] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">
                نصنع الـ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#2dd4bf] to-[#115e59]">
                  إتقان
                </span>
              </h1>
            </div>
          }
        >
          <div className="w-full h-full flex items-center justify-center p-6">
            <Logo3DCard className="w-full max-w-lg" />
          </div>
        </ContainerScroll>

        <div className="flex flex-col items-center text-center px-4 pb-20 -mt-20 md:-mt-40 relative z-20">
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
