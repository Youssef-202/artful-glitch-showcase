import RetroGrid from "@/components/ui/retro-grid";

/**
 * Persistent site-wide background.
 * Buildings only (no grid squares, no scanlines) — softened for readability.
 */
export default function PersistentCanvas() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <div className="absolute inset-0 opacity-40">
        <RetroGrid
          gridColor="#0d9b6c"
          showScanlines={false}
          glowEffect
          showBuildings
          showGrid={false}
        />
      </div>
      {/* Soft veil to reduce visual noise behind content */}
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
    </div>
  );
}
