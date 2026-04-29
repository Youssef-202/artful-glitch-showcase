import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRef } from "react";
import * as THREE from "three";

function HeroOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * 0.15;
    ref.current.rotation.y += dt * 0.2;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.6, 4]} />
        <MeshDistortMaterial color="#3565F5" emissive="#1a3aa8" emissiveIntensity={0.4} distort={0.45} speed={2} roughness={0.15} metalness={0.6} />
      </mesh>
    </Float>
  );
}

export default function Hero() {
  return (
    <section className="snap-start relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -3, -5]} color="#3565F5" intensity={2} />
          <HeroOrb />
          <Sparkles count={80} scale={6} size={2.5} speed={0.4} color="#8aa6ff" />
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
          وكالة إبداعية رقمية
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight"
        >
          <span className="text-gradient">[اسم الشركة]</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-6 text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto"
        >
          نصنع التجارب الرقمية التي تُحوّل الأفكار إلى علامات لا تُنسى.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#account" className="glass-strong hover:bg-white/10 transition rounded-full px-7 py-4 font-bold">
            استكشف خدماتنا
          </a>
          <a href="#brand" className="rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
            ابدأ مشروعك
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tracking-widest"
      >
        ↓ مرّر للأسفل
      </motion.div>
    </section>
  );
}
