import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import * as THREE from "three";

function Model() {
  const ref = useRef<THREE.Group>(null);
  const gltf = useGLTF("/models/etqan.glb");

  gltf.scene.traverse((obj: any) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0f766e"),
        metalness: 0.95,
        roughness: 0.18,
        emissive: new THREE.Color("#1D9E75"),
        emissiveIntensity: 0.28,
      });
    }
  });

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.4 / maxDim;

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * ((Math.PI * 2) / 20);
  });

  return (
    <group ref={ref}>
      <primitive
        object={gltf.scene}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
        scale={scale}
      />
    </group>
  );
}
useGLTF.preload("/models/etqan.glb");

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 4]} intensity={2.2} color="#1D9E75" />
      <pointLight position={[-6, 2, 3]} intensity={1.4} color="#5DCAA5" />
      <pointLight position={[0, -4, 3]} intensity={0.8} color="#C8A84B" />
      <directionalLight position={[0, 5, 5]} intensity={0.6} />
      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.5}>
          <Model />
        </Float>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

/** Fades a panel in over [start, mid] and out over [mid, end] */
function usePanelOpacity(progress: MotionValue<number>, start: number, mid: number, end: number) {
  return useTransform(progress, [start, mid - 0.02, mid + 0.02, end], [0, 1, 1, 0]);
}
function usePanelY(progress: MotionValue<number>, start: number, mid: number, end: number) {
  return useTransform(progress, [start, mid, end], [40, 0, -40]);
}

export default function EtqanHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 0 → 0.33 hero centered | 0.33 → 0.66 vision | 0.66 → 1 about (then fade)
  // Logo moves from center → right side during 0.15 → 0.55, then fades 0.85 → 1
  const logoX = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.85, 1], ["0%", "0%", "28%", "28%", "28%"]);
  const logoScale = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.85, 1], [1, 1, 0.78, 0.78, 0.6]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.15, 0.55, 0.85, 1], [1, 1, 0.4, 0.4, 0]);

  // Hero text (centered)
  const heroOpacity = usePanelOpacity(scrollYProgress, 0, 0.05, 0.22);
  const heroY = usePanelY(scrollYProgress, 0, 0.05, 0.22);

  // Vision (first scroll)
  const visionOpacity = usePanelOpacity(scrollYProgress, 0.25, 0.4, 0.55);
  const visionY = usePanelY(scrollYProgress, 0.25, 0.4, 0.55);

  // About (second scroll)
  const aboutOpacity = usePanelOpacity(scrollYProgress, 0.58, 0.72, 0.88);
  const aboutY = usePanelY(scrollYProgress, 0.58, 0.72, 0.88);

  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative w-full"
      style={{ height: "320vh" }}
    >
      <div
        className="sticky top-0 w-full h-screen overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #0a0e1a 0%, #000000 70%)" }}
      >
        {/* 3D logo layer (moves with scroll) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ x: logoX, scale: logoScale, opacity: logoOpacity }}
        >
          {/* White ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: "min(560px, 70vw)",
              height: "min(560px, 70vw)",
              border: "1.5px solid rgba(255,255,255,0.5)",
              boxShadow:
                "0 0 80px 10px rgba(29,158,117,0.25), inset 0 0 60px rgba(255,255,255,0.04)",
              opacity: ringOpacity,
            }}
          />
          {/* Soft glow disc */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "min(560px, 70vw)",
              height: "min(560px, 70vw)",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)",
            }}
          />
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <Scene />
            </Canvas>
          </div>
        </motion.div>

        {/* Panel 1 — Hero centered */}
        <motion.div
          className="absolute inset-x-0 bottom-[12vh] flex flex-col items-center text-center px-6 z-10 pointer-events-none"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <h1
            className="font-black"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(40px, 7vw, 64px)",
              color: "#1D9E75",
              lineHeight: 1,
              textShadow: "0 0 30px rgba(29,158,117,0.5)",
            }}
          >
            إتقان
          </h1>
          <p
            className="mt-3 font-light"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(16px, 2.4vw, 24px)",
              color: "#5DCAA5",
            }}
          >
            في إتقان نصنع من رؤيتك حقيقة
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 opacity-60">
            <span style={{ color: "#5DCAA5", fontFamily: "'Cairo', sans-serif", fontSize: 12, letterSpacing: 4 }}>
              مرر للأسفل
            </span>
            <div className="w-[1px] h-12" style={{ background: "linear-gradient(to bottom, #1D9E75, transparent)" }} />
          </div>
        </motion.div>

        {/* Panel 2 — رؤيتنا (left side, RTL means visually right of viewport vs logo on left… we keep text on the right since RTL) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 right-[6vw] max-w-[42vw] z-10 pointer-events-none"
          style={{ opacity: visionOpacity, y: visionY }}
        >
          <span
            className="inline-block mb-4 px-3 py-1 rounded-full border"
            style={{
              borderColor: "rgba(29,158,117,0.35)",
              color: "#5DCAA5",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 12,
              letterSpacing: 4,
            }}
          >
            01 — VISION
          </span>
          <h2
            className="font-black mb-6"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 72px)",
              color: "#1D9E75",
              lineHeight: 1.05,
              textShadow: "0 0 30px rgba(29,158,117,0.35)",
            }}
          >
            رؤيتنا
          </h2>
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(15px, 1.4vw, 20px)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.9,
            }}
          >
            أن نكون الوكالة الرائدة في صناعة العلامات التجارية والتسويق الرقمي،
            نُقدّم تجارب بصرية مُتقنة تجمع بين الإبداع والاحترافية، لنصنع أثراً
            يمتد في السوق السعودي والعربي.
          </p>
        </motion.div>

        {/* Panel 3 — من نحن */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 right-[6vw] max-w-[42vw] z-10 pointer-events-none"
          style={{ opacity: aboutOpacity, y: aboutY }}
        >
          <span
            className="inline-block mb-4 px-3 py-1 rounded-full border"
            style={{
              borderColor: "rgba(200,168,75,0.4)",
              color: "#C8A84B",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 12,
              letterSpacing: 4,
            }}
          >
            02 — ABOUT
          </span>
          <h2
            className="font-black mb-6"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 72px)",
              color: "#1D9E75",
              lineHeight: 1.05,
              textShadow: "0 0 30px rgba(29,158,117,0.35)",
            }}
          >
            من نحن
          </h2>
          <p
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: "clamp(15px, 1.4vw, 20px)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.9,
            }}
          >
            وكالة إتقان الرائدة في التسويق الرقمي والتصميم الإبداعي. نُقدّم
            حلولاً متكاملة للعلامات التجارية في السعودية والوطن العربي،
            بفريقٍ يجمع بين الفن والتقنية لصياغة هوياتٍ لا تُنسى.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
