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
    <section className="relative min-h-[calc(100vh-6rem)] w-full flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <pointLight position={[-5, -3, -5]} color="#5fd9cf" intensity={3} />
          <pointLight position={[5, 3, 2]} color="#115e59" intensity={2} />
          <Stars radius={50} depth={30} count={1200} factor={4} fade speed={0.6} />
          <LogoMesh />
          <Sparkles count={180} scale={8} size={3} speed={0.5} color="#5fd9cf" />
        </Canvas>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs sm:text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t.common.tagline}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight"
        >
          <span className="text-gradient">{t.common.heroTitle}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-6 text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto"
        >
          {t.common.heroSubtitle}
        </motion.p>

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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest"
      >
        ↓ {t.common.scrollDown}
      </motion.div>
    </section>
  );
}
