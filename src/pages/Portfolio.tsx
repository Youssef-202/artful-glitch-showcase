import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, RoundedBox } from "@react-three/drei";
import { useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageProvider";
import { type PortfolioItem } from "@/lib/portfolio";
import { usePortfolio } from "@/lib/usePortfolio";

function CardItem({
  it, isSel, position, rotationY, onSelect, lang,
}: {
  it: PortfolioItem; isSel: boolean; position: [number, number, number]; rotationY: number;
  onSelect: (id: string) => void; lang: "ar" | "en";
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
      <group position={position} rotation={[0, rotationY, 0]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(it.id); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = ""; }}
          scale={isSel ? 1.15 : 1}
        >
          <RoundedBox args={[1.8, 2.4, 0.18]} radius={0.12} smoothness={4}>
            <meshStandardMaterial
              color={it.color}
              emissive={it.accent}
              emissiveIntensity={isSel ? 0.5 : 0.2}
              metalness={0.5}
              roughness={0.35}
            />
          </RoundedBox>
        </mesh>
        {/* Cover image as HTML on the front face — bypasses CORS texture issues */}
        <Html
          position={[0, 0, 0.1]}
          transform
          occlude
          distanceFactor={1.6}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              width: "180px",
              height: "240px",
              borderRadius: "14px",
              overflow: "hidden",
              background: `linear-gradient(135deg, ${it.color}, ${it.accent})`,
              boxShadow: isSel
                ? `0 0 40px ${it.accent}`
                : `0 6px 20px rgba(0,0,0,0.4)`,
              transform: `scale(${isSel ? 1.15 : 1})`,
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            {it.coverUrl && (
              <img
                src={it.coverUrl}
                alt={lang === "ar" ? it.titleAr : it.titleEn}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0) 50%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                right: 8,
                color: "white",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "center",
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              {lang === "ar" ? it.titleAr : it.titleEn}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}


/** Interactive 3D portfolio carousel: items arranged in a ring, drag to rotate */
function PortfolioRing({
  items,
  onSelect,
  selectedId,
  lang,
}: {
  items: PortfolioItem[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  lang: "ar" | "en";
}) {
  const group = useRef<THREE.Group>(null);
  const targetRot = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const { gl } = useThree();

  // Pointer drag handlers on canvas DOM
  useMemo(() => {
    const dom = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      dom.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      targetRot.current += dx * 0.005;
      velocity.current = dx * 0.005;
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try { dom.releasePointerCapture(e.pointerId); } catch {}
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointerleave", onUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointerleave", onUp);
    };
  }, [gl]);

  useFrame((_, dt) => {
    if (!group.current) return;
    if (!dragging.current) {
      targetRot.current += velocity.current;
      velocity.current *= 0.94;
      targetRot.current += dt * 0.1; // gentle auto-rotate
    }
    group.current.rotation.y += (targetRot.current - group.current.rotation.y) * 0.12;
  });

  const radius = 4.2;
  return (
    <group ref={group}>
      {items.map((it, i) => {
        const angle = (i / items.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isSel = selectedId === it.id;
        return (
          <Suspense key={it.id} fallback={null}>
            <CardItem
              it={it}
              isSel={isSel}
              position={[x, 0, z]}
              rotationY={-angle + Math.PI / 2}
              onSelect={onSelect}
              lang={lang}
            />
          </Suspense>
        );
      })}
    </group>
  );
}

export default function Portfolio() {
  const { t, lang } = useLang();
  const { items: portfolioItems } = usePortfolio();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? portfolioItems : portfolioItems.filter((p) => p.category === filter)),
    [filter, portfolioItems]
  );
  const selectedItem = portfolioItems.find((p) => p.id === selected);

  const cats = [
    { id: "all", label: t.portfolio.categories.all },
    { id: "branding", label: t.portfolio.categories.branding },
    { id: "web", label: t.portfolio.categories.web },
    { id: "design", label: t.portfolio.categories.design },
    { id: "photo", label: t.portfolio.categories.photo },
  ];

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <p className="text-sm text-primary tracking-widest mb-3">{t.portfolio.kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{t.portfolio.title}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.portfolio.subtitle}</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => { setFilter(c.id); setSelected(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              filter === c.id
                ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow"
                : "glass hover:bg-foreground/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3D ring */}
      <div className="relative h-[60vh] lg:h-[70vh] rounded-3xl overflow-hidden glass shadow-elegant">
        <Suspense fallback={<div className="w-full h-full animate-pulse" />}>
          <Canvas camera={{ position: [0, 1.2, 7.5], fov: 55 }} dpr={[1, 2]}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight position={[-5, 2, 3]} color="#5fd9cf" intensity={2} />
            <pointLight position={[5, -2, -3]} color="#115e59" intensity={2} />
            <PortfolioRing items={filtered} onSelect={setSelected} selectedId={selected} lang={lang} />
          </Canvas>
        </Suspense>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground glass rounded-full px-4 py-2">
          ✦ {t.portfolio.hint}
        </div>
      </div>

      {/* Selected detail */}
      {selectedItem && (
        <motion.div
          key={selectedItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 mt-8 mb-12 max-w-2xl mx-auto text-center"
        >
          <p className="text-xs text-primary tracking-widest mb-2">
            {t.portfolio.categories[selectedItem.category]}
          </p>
          <h3 className="text-2xl font-black mb-2">
            {lang === "ar" ? selectedItem.titleAr : selectedItem.titleEn}
          </h3>
          <p className="text-muted-foreground">
            {lang === "ar" ? selectedItem.clientAr : selectedItem.clientEn}
          </p>
        </motion.div>
      )}

      <div className="h-12" />
    </div>
  );
}
