import { useRef, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

interface Logo3DCardProps {
  className?: string;
  imageUrl?: string;
}

export default function Logo3DCard({ className = "", imageUrl }: Logo3DCardProps) {
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
    <div className={`relative flex justify-center lg:justify-end ${className}`}>
      <div className="relative w-full aspect-square max-w-md flex items-center justify-center">
        <div
          className="absolute w-full h-full border-[16px] sm:border-[20px] border-[#2dd4bf] opacity-10 rotate-45 rounded-3xl"
          style={{ animation: "logo3dSpin 60s linear infinite" }}
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
              src={imageUrl || logoWhite}
              alt="إتقان"
              draggable={false}
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes logo3dSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
