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
    <section className="relative min-h-[calc(100vh-6rem)] w-full flex items-center justify-center overflow-hidden px-4 sm:px-8">
      {/* Ambient stars background only */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <Stars radius={50} depth={30} count={1200} factor={4} fade speed={0.6} />
          <Sparkles count={120} scale={10} size={2.5} speed={0.4} color="#5fd9cf" />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center py-6">
        <div className="relative w-full max-w-full flex items-center justify-center isolate overflow-hidden">
          <motion.span
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute z-30 right-[2%] sm:right-[4%] lg:right-[6%] top-[55%] -translate-y-1/2 text-3xl sm:text-5xl lg:text-7xl font-arabic font-black tracking-widest bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)] pointer-events-none select-none"
          >
            وكـــــــــالـــــة
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute z-30 left-[2%] sm:left-[4%] lg:left-[6%] top-[55%] -translate-y-1/2 text-3xl sm:text-5xl lg:text-7xl font-arabic font-black tracking-widest bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)] pointer-events-none select-none"
          >
            إتــــــــقــــــــان
          </motion.span>
          <div className="relative z-20 h-[240px] w-[280px] sm:h-[380px] sm:w-[440px] lg:h-[720px] lg:w-[830px] shrink-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={1.4} />
              <pointLight position={[-5, -3, -5]} color="#5fd9cf" intensity={3} />
              <pointLight position={[5, 3, 2]} color="#115e59" intensity={2} />
              <LogoMesh />
              <Sparkles count={80} scale={6} size={2.5} speed={0.5} color="#5fd9cf" />
            </Canvas>
          </div>
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
