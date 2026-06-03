import RetroGrid from "@/components/ui/retro-grid";

/**
 * Persistent site-wide background (Retro Grid).
 * Fixed behind all content via -z-20.
 */
export default function PersistentCanvas() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <RetroGrid gridColor="#22d3ee" showScanlines glowEffect />
    </div>
  );
}
