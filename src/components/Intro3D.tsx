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
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.5 + t * 0.4;
    groupRef.current.position.y = Math.sin(t * 1.2) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Glow halo */}
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

export default function Intro3D() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
              <color attach="background" args={["#020617"]} />
              <fog attach="fog" args={["#020617", 5, 18]} />
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 5, 5]} intensity={1.5} />
              <MovingLight />
              <pointLight position={[-5, 3, 2]} color="#115e59" intensity={4} />
              <pointLight position={[3, -3, 2]} color="#5fd9cf" intensity={3} />
              <Stars radius={40} depth={30} count={2500} factor={5} fade speed={2} />
              <Sparkles count={250} scale={12} size={4} speed={1.2} color="#5fd9cf" />
              <Sparkles count={120} scale={6} size={6} speed={0.8} color="#ffffff" />
              <IntroLogo />
            </Canvas>
          </div>

          {/* Light beams overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 2, times: [0, 0.5, 1] }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(95,217,207,0.25), transparent 60%)",
            }}
          />

          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-[18%] left-0 right-0 text-center pointer-events-none"
          >
            <p
              lang="ar"
              dir="rtl"
              className="font-black text-[#5fd9cf]"
              style={{
                fontFamily: '"Roboto Condensed", sans-serif',
                fontSize: "clamp(1.5rem, 4vw, 3rem)",
                textShadow:
                  "0 0 12px rgba(95,217,207,0.8), 0 0 32px rgba(95,217,207,0.5)",
              }}
            >
              وكـــالــة إتـــقــان
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
