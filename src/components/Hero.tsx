import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import logo3d from "@/assets/etqan-logo-3d.png";

function LogoMesh() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    texture.anisotropy = 16;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [texture]);

  const aspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
  const w = 4.2;
  const h = w / aspect;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const targetY = mouse.current.x * 0.8;
    const targetX = -mouse.current.y * 0.5;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    groupRef.current.position.x += (mouse.current.x * 0.4 - groupRef.current.position.x) * 0.04;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={groupRef}>
        <mesh position={[0, 0, -0.05]} scale={1.18}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent opacity={0.35} color="#5fd9cf" depthWrite={false} />
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
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Hero() {
  const { t } = useLang();
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden px-4 sm:px-8 py-8">
      {/* Ambient stars background only */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <Stars radius={50} depth={30} count={1200} factor={4} fade speed={0.6} />
          <Sparkles count={120} scale={10} size={2.5} speed={0.4} color="#5fd9cf" />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs sm:text-sm mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t.common.tagline}
        </motion.div>

        {/* Big centered logo with words pinned to the screen edges */}
        <div className="relative w-screen flex items-center justify-center -mx-4 sm:-mx-8">
          <motion.span
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="pointer-events-none absolute right-3 sm:right-8 lg:right-16 top-1/2 -translate-y-1/2 text-gradient text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight whitespace-nowrap z-30 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
          >
            وكـــــالـــــة
          </motion.span>

          <div className="relative h-[240px] w-[180px] sm:h-[340px] sm:w-[260px] lg:h-[440px] lg:w-[340px] shrink-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={1.4} />
              <pointLight position={[-5, -3, -5]} color="#5fd9cf" intensity={3} />
              <pointLight position={[5, 3, 2]} color="#115e59" intensity={2} />
              <LogoMesh />
              <Sparkles count={80} scale={6} size={2.5} speed={0.5} color="#5fd9cf" />
            </Canvas>
          </div>

          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="pointer-events-none absolute left-3 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 text-gradient text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight whitespace-nowrap z-30 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
          >
            إتــــقــــــان
          </motion.span>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 text-base sm:text-xl text-muted-foreground max-w-2xl"
        >
          {t.common.heroSubtitle}
        </motion.p>

        {/* Buttons: استكشف on right, ابدأ on left (RTL natural order) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/services" className="glass-strong hover:bg-foreground/5 transition rounded-full px-7 py-4 font-bold">
            {t.common.ctaExplore}
          </Link>
          <Link to="/contact" className="rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
            {t.common.ctaStart}
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest"
      >
        ↓ {t.common.scrollDown}
      </motion.div>
    </section>
  );
}
