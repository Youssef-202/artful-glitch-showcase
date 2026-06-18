import RetroGrid from "@/components/ui/retro-grid";

/**
 * Persistent site-wide background.
 * Buildings + futuristic sky (stars + horizon glow). No grid squares, no mouse parallax.
 */
export default function PersistentCanvas() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden hidden dark:block">
      {/* Twinkling starfield (above horizon ~55%) */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] opacity-70"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 12% 18%, rgba(180,255,220,0.9), transparent 60%)",
            "radial-gradient(1px 1px at 28% 42%, rgba(140,240,200,0.7), transparent 60%)",
            "radial-gradient(1.5px 1.5px at 47% 12%, rgba(200,255,230,0.9), transparent 60%)",
            "radial-gradient(1px 1px at 63% 33%, rgba(160,240,210,0.75), transparent 60%)",
            "radial-gradient(1px 1px at 78% 22%, rgba(190,255,225,0.85), transparent 60%)",
            "radial-gradient(1.5px 1.5px at 88% 48%, rgba(160,255,210,0.8), transparent 60%)",
            "radial-gradient(1px 1px at 36% 65%, rgba(180,255,220,0.7), transparent 60%)",
            "radial-gradient(1px 1px at 7% 72%, rgba(200,255,230,0.6), transparent 60%)",
            "radial-gradient(1px 1px at 55% 78%, rgba(150,240,200,0.65), transparent 60%)",
            "radial-gradient(1.5px 1.5px at 92% 8%, rgba(220,255,235,0.9), transparent 60%)",
          ].join(","),
        }}
      />

      {/* Horizon glow band */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "48%",
          height: "14%",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(3,108,95,0.40), rgba(3,108,95,0.15) 50%, transparent 75%)",
          filter: "blur(2px)",
        }}
      />

      {/* Buildings layer */}
      <div className="absolute inset-0 opacity-65">
        <RetroGrid
          gridColor="#036c5f"

          showScanlines={false}
          glowEffect
          showBuildings
          showGrid={false}
        />
      </div>

      {/* Soft veil to reduce visual noise behind content */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
    </div>
  );
}
