import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import logo3d from "@/assets/etqan-logo-3d.png";

/* Custom shader: animated gradient sphere with fresnel rim */
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float n = sin(p.x * 3.0 + uTime) * 0.08
            + sin(p.y * 4.0 + uTime * 1.3) * 0.08
            + sin(p.z * 5.0 + uTime * 0.7) * 0.06;
    p += normal * n;
    vPosition = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fres = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
    float t = 0.5 + 0.5 * sin(uTime * 0.5 + vPosition.y * 1.5);
    vec3 base = mix(uColorA, uColorB, t);
    vec3 col = mix(base, uColorC, fres);
    gl_FragColor = vec4(col, 0.95);
  }
`;

function ShaderOrb() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#0a3d3a") },
      uColorB: { value: new THREE.Color("#115e59") },
      uColorC: { value: new THREE.Color("#a7f0e8") },
    }),
    []
  );
  useFrame((state, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.25;
      meshRef.current.rotation.x += dt * 0.1;
    }
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 64]} />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}

function OrbitingShard({ radius, speed, offset, size }: { radius: number; speed: number; offset: number; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 1.3) * 0.6;
    ref.current.rotation.x += 0.02;
    ref.current.rotation.y += 0.03;
  });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color="#5fd9cf" emissive="#115e59" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
    </mesh>
  );
}

function DistortShell() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.08;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} scale={2.6}>
        <icosahedronGeometry args={[1, 3]} />
        <MeshDistortMaterial color="#0a3d3a" emissive="#115e59" emissiveIntensity={0.1} distort={0.35} speed={1.2} roughness={0.4} metalness={0.5} wireframe transparent opacity={0.25} />
      </mesh>
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
