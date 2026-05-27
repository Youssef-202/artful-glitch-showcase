import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

export default function ArchitecturalHero() {
  const logoRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = logoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -25, y: px * 25 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

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

      <div className="relative z-10 max-w-7xl w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Section 1 — Content (5/12) */}
        <div className="lg:col-span-5 min-h-[420px] flex flex-col items-start text-right rounded-3xl p-6 lg:p-8 border border-[#2dd4bf]/10 bg-[#0a2e2b]/20 backdrop-blur-sm">
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
        <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
          <div className="relative w-full aspect-square max-w-md flex items-center justify-center">
            <div
              className="absolute w-full h-full border-[16px] sm:border-[20px] border-[#2dd4bf] opacity-10 rotate-45 rounded-3xl"
              style={{ animation: "spin 60s linear infinite" }}
            />
            <div className="absolute w-[85%] h-[85%] border-2 border-[#2dd4bf]/20 rotate-45 rounded-3xl" />
            <div className="absolute w-[65%] h-[65%] border-4 border-[#115e59] rotate-12 rounded-3xl" />

            {/* Central mark */}
            <div
              ref={logoRef}
              onMouseMove={handleMove}
              onMouseLeave={reset}
              className="relative z-20 p-6 sm:p-8 bg-[#0a2e2b]/80 backdrop-blur-md shadow-[0_0_60px_-15px_rgba(45,212,191,0.4)] border border-[#2dd4bf]/20 rounded-3xl transition-transform duration-200 ease-out cursor-pointer"
              style={{
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
                style={{ transform: "translateZ(40px)" }}
              >
                <img
                  src={logoWhite}
                  alt="إتقان"
                  draggable={false}
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Floating labels */}
            <div className="absolute top-0 right-0 bg-[#115e59] p-3 sm:p-4 backdrop-blur-md border border-[#2dd4bf]/30 translate-x-2 -translate-y-2 sm:translate-x-4 sm:-translate-y-4 shadow-2xl">
              <p
                className="text-[#2dd4bf] text-xs sm:text-sm font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Est. 2024
              </p>
            </div>
            <div className="absolute z-30 -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-[#f5f3ee] text-[#0a2e2b] px-4 sm:px-6 py-2 sm:py-3 font-bold shadow-2xl text-sm sm:text-base">
              ١٠٠٪ دقة
            </div>
          </div>
        </div>
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
