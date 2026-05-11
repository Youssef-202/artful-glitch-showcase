import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles as DreiSparkles } from "@react-three/drei";
import * as THREE from "three";
import { useLang } from "@/i18n/LanguageProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import logo3d from "@/assets/etqan-logo-3d.png";

function LogoCore() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const groupRef = useRef<THREE.Group>(null);
  useEffect(() => {
    texture.anisotropy = 16;
  }, [texture]);
  const aspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
  const w = 3.4;
  const h = w / aspect;
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.3;
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.1;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        <mesh position={[0, 0, -0.05]} scale={1.2}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent opacity={0.4} color="#5fd9cf" depthWrite={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            side={THREE.DoubleSide}
            metalness={0.6}
            roughness={0.25}
            emissive={new THREE.Color("#5fd9cf")}
            emissiveMap={texture}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Orbital 3D portfolio: cards revolve around a glowing central "planet".
 * Auto-rotates continuously; arrows / dots snap to bring a card to the front.
 */
export default function PortfolioMarquee() {
  const { t, lang, dir } = useLang();
  const { items } = usePortfolio();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const angleRef = useRef(0);
  const [, force] = useState(0);
  const count = items.length;

  const next = useCallback(() => setActive((i) => (i + 1) % Math.max(count, 1)), [count]);
  const prev = useCallback(() => setActive((i) => (i - 1 + count) % Math.max(count, 1)), [count]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        angleRef.current = (angleRef.current + dt * 18) % 360;
        force((n) => (n + 1) % 1000);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  if (!count) return null;
  const current = items[active];

  const radius = 360;
  const step = 360 / count;

  return (
    <section
      className="relative py-24 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-60" />
      <motion.div
        key={`bg-${active}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(900px 500px at 50% 50%, ${current.color}55, transparent 60%)`,
        }}
      />
      {/* twinkling stars */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground/60 animate-pulse"
            style={{
              left: `${(i * 137.5) % 100}%`,
              top: `${(i * 53.7) % 100}%`,
              animationDelay: `${(i % 10) * 0.3}s`,
              animationDuration: `${2 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative px-6 sm:px-12 max-w-7xl mx-auto mb-12 flex items-end justify-between gap-6 flex-wrap">
        <div className={dir === "rtl" ? "text-right" : "text-left"}>
          <p className="text-xs sm:text-sm text-primary tracking-[0.3em] mb-3 font-bold">{t.common.ourWork}</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="text-gradient">{t.portfolio.title}</span>
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition text-sm"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </div>

      {/* orbital stage */}
      <div className="relative h-[640px] sm:h-[720px]" style={{ perspective: "1800px" }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {/* orbit rings */}
          <div
            className="absolute rounded-full border border-primary/20"
            style={{
              width: radius * 2,
              height: radius * 2,
              transform: "rotateX(68deg)",
              boxShadow: "0 0 80px hsl(var(--primary) / 0.15) inset",
            }}
          />
          <div
            className="absolute rounded-full border border-primary/10"
            style={{
              width: radius * 2.3,
              height: radius * 2.3,
              transform: "rotateX(68deg)",
            }}
          />

          {/* central logo "planet" */}
          <div className="absolute" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute -inset-16 rounded-full bg-primary/25 blur-3xl animate-pulse" />
            <div className="absolute -inset-8 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative w-56 h-56 sm:w-72 sm:h-72">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.4} />
                <pointLight position={[-5, -3, -5]} color="#5fd9cf" intensity={3} />
                <pointLight position={[5, 3, 2]} color="#115e59" intensity={2} />
                <LogoCore />
                <DreiSparkles count={60} scale={5} size={2} speed={0.5} color="#5fd9cf" />
              </Canvas>
            </div>
          </div>

          {/* orbiting cards */}
          {items.map((item, i) => {
            const baseAngle = i * step - active * step + angleRef.current;
            const rad = (baseAngle * Math.PI) / 180;
            const x = Math.sin(rad) * radius;
            const z = Math.cos(rad) * radius;
            const depth = (z + radius) / (radius * 2); // 0..1
            const scale = 0.55 + depth * 0.55;
            const opacity = 0.25 + depth * 0.75;
            const isActive = i === active;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(i)}
                className="absolute top-1/2 left-1/2"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: Math.round(depth * 1000),
                }}
                animate={{
                  x: x - 110,
                  y: -150,
                  scale,
                  opacity,
                }}
                transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.4 }}
                aria-label={lang === "ar" ? item.titleAr : item.titleEn}
              >
                <div
                  className={`relative w-[220px] aspect-[3/4] rounded-2xl overflow-hidden glass border shadow-elegant ${
                    isActive ? "border-primary/60 ring-2 ring-primary/40 shadow-glow" : "border-white/10"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent})` }}
                >
                  {item.coverUrl && (
                    <img
                      src={item.coverUrl}
                      alt={lang === "ar" ? item.titleAr : item.titleEn}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-md text-primary font-bold tracking-wider">
                    {t.portfolio.categories[item.category]}
                  </span>
                  <span className="absolute top-3 right-3 text-xs font-black text-foreground/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={prev}
          className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 z-[2000] glass rounded-full p-3 hover:scale-110 transition border border-white/10"
          aria-label="prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-[2000] glass rounded-full p-3 hover:scale-110 transition border border-white/10"
          aria-label="next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 mt-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-2xl sm:text-3xl font-black mb-2">
              {lang === "ar" ? current.titleAr : current.titleEn}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? current.clientAr : current.clientEn}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-8 bg-primary shadow-glow" : "w-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
