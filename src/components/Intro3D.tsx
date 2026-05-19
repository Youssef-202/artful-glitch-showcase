import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import logo3d from "@/assets/etqan-logo-3d.png";

function IntroLogo() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    texture.anisotropy = 16;
  }, [texture]);

  const aspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
  const w = 4.5;
  const h = w / aspect;

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef}>
        <mesh position={[0, 0, -0.1]} scale={1.4}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent opacity={0.45} color="#5fd9cf" depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.2]} scale={1.8}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent opacity={0.2} color="#5fd9cf" depthWrite={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            side={THREE.DoubleSide}
            metalness={0.8}
            roughness={0.2}
            emissive={new THREE.Color("#5fd9cf")}
            emissiveMap={texture}
            emissiveIntensity={0.7}
          />
        </mesh>
      </group>
    </Float>
  );
}

function MovingLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = Math.cos(t * 1.5) * 4;
    ref.current.position.y = Math.sin(t * 1.5) * 3;
  });
  return <pointLight ref={ref} color="#5fd9cf" intensity={6} distance={15} />;
}

type Phase = "text" | "logo" | "done";

export default function Intro3D() {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<Phase>("text");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("logo"), 1600);
    const t2 = setTimeout(() => setShow(false), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "#020617" }}
        >
          {/* Ambient backdrop glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(95,217,207,0.18), transparent 65%)",
            }}
          />

          <AnimatePresence mode="wait">
            {phase === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center px-6"
              >
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-black tracking-wide"
                  style={{
                    fontFamily: '"Roboto Condensed", sans-serif',
                    fontSize: "clamp(2rem, 6vw, 4.5rem)",
                    color: "#5fd9cf",
                    textShadow:
                      "0 0 18px rgba(95,217,207,0.85), 0 0 48px rgba(95,217,207,0.45)",
                  }}
                >
                  وكـــالــة إتـــقــان
                </p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="mx-auto mt-4 h-[2px] w-40 origin-center"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #5fd9cf, transparent)",
                  }}
                />
              </motion.div>
            )}

            {phase === "logo" && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
                  <color attach="background" args={["#020617"]} />
                  <fog attach="fog" args={["#020617", 5, 18]} />
                  <ambientLight intensity={0.3} />
                  <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <MovingLight />
                  <pointLight position={[-5, 3, 2]} color="#115e59" intensity={4} />
                  <pointLight position={[3, -3, 2]} color="#5fd9cf" intensity={3} />
                  <Stars radius={40} depth={30} count={2000} factor={5} fade speed={2} />
                  <Sparkles count={200} scale={12} size={4} speed={1.2} color="#5fd9cf" />
                  <Sparkles count={100} scale={6} size={6} speed={0.8} color="#ffffff" />
                  <IntroLogo />
                </Canvas>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
