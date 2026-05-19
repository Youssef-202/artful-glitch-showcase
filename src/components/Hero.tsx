import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { LampContainer } from "@/components/ui/lamp";
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
    <section className="relative w-full overflow-hidden px-4 sm:px-8">
      {/* Ambient stars background only */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <Stars radius={50} depth={30} count={1200} factor={4} fade speed={0.6} />
          <Sparkles count={120} scale={10} size={2.5} speed={0.4} color="#5fd9cf" />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        <LampContainer className="min-h-[600px] sm:min-h-[680px] lg:min-h-[760px] bg-transparent">
          <div dir="rtl" className="relative w-full max-w-[900px] flex items-center justify-center isolate">
            <motion.span
              initial={{ opacity: 0, x: -30, filter: "brightness(0.4)" }}
              whileInView={{ opacity: 1, x: 0, filter: "brightness(1)" }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
              lang="ar"
              dir="rtl"
              className="absolute z-30 right-[1%] sm:right-[3%] lg:right-[4%] top-1/2 -translate-y-1/2 font-black leading-none whitespace-nowrap text-primary pointer-events-none select-none tracking-[0.08em]"
              style={{ fontFamily: '"Roboto Condensed", sans-serif', fontSize: "clamp(1.9rem, 5.2vw, 4.4rem)", fontWeight: 800, textShadow: "0 0 10px hsl(var(--primary) / 0.7), 0 0 28px hsl(var(--primary) / 0.45), 0 0 60px hsl(var(--primary) / 0.25)" }}
            >
              وكـــــالـــــة
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 30, filter: "brightness(0.4)" }}
              whileInView={{ opacity: 1, x: 0, filter: "brightness(1)" }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
              lang="ar"
              dir="rtl"
              className="absolute z-30 left-[1%] sm:left-[3%] lg:left-[4%] top-1/2 -translate-y-1/2 font-black leading-none whitespace-nowrap text-primary pointer-events-none select-none tracking-[0.08em]"
              style={{ fontFamily: '"Roboto Condensed", sans-serif', fontSize: "clamp(1.9rem, 5.2vw, 4.4rem)", fontWeight: 800, textShadow: "0 0 10px hsl(var(--primary) / 0.7), 0 0 28px hsl(var(--primary) / 0.45), 0 0 60px hsl(var(--primary) / 0.25)" }}
            >
              إتـــــقـــــان
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: -10, filter: "brightness(0.3)" }}
              whileInView={{ opacity: 1, y: 0, filter: "brightness(1)" }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
              whileHover={{ scale: 1.04, rotate: [0, -2, 2, 0] }}
              className="logo-hover-glow group relative z-20 h-[140px] w-[240px] sm:h-[200px] sm:w-[360px] lg:h-[300px] lg:w-[520px] max-w-full shrink-0 flex items-center justify-center cursor-pointer"
              style={{ filter: "drop-shadow(0 0 22px hsl(var(--primary) / 0.55)) drop-shadow(0 0 60px hsl(var(--primary) / 0.3))" }}
            >
              <img
                src={logo3d}
                alt={t.common.brand}
                className="w-full h-full object-contain transition-all duration-500 group-hover:[filter:hue-rotate(60deg)_saturate(1.5)_brightness(1.15)] group-hover:animate-[logoPulse_1.6s_ease-in-out_infinite]"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,hsl(var(--primary)/0.3),hsl(var(--accent)/0.3),hsl(var(--primary)/0.3))] blur-2xl" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "brightness(0.4)" }}
            whileInView={{ opacity: 1, y: 0, filter: "brightness(1)" }}
            transition={{ duration: 0.9, delay: 0.7, ease: "easeInOut" }}
            className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl text-center"
          >
            {t.common.heroSubtitle}
          </motion.p>

          {/* Buttons: استكشف on right, ابدأ on left (RTL natural order) */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "brightness(0.4)" }}
            whileInView={{ opacity: 1, y: 0, filter: "brightness(1)" }}
            transition={{ duration: 0.9, delay: 0.85, ease: "easeInOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/services" className="glass-strong hover:bg-foreground/5 transition rounded-full px-7 py-4 font-bold">
              {t.common.ctaExplore}
            </Link>
            <Link to="/contact" className="rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
              {t.common.ctaStart}
            </Link>
          </motion.div>
        </LampContainer>
      </div>

    </section>
  );
}
