import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
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
  // Fill the glowing circle a bit more
  const scale = 2.6 / maxDim;

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
  // Smooth the scroll progress for buttery transitions
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.6 });

  // Logo path: LEFT (hero hold) → RIGHT (vision hold) → LEFT (about hold) → fade
  const logoX = useTransform(
    progress,
    [0, 0.22, 0.36, 0.58, 0.72, 0.92, 1],
    ["-44%", "-44%", "44%", "44%", "-44%", "-44%", "-44%"]
  );
  const logoScale = useTransform(progress, [0, 0.9, 1], [1, 1, 0.85]);
  const logoOpacity = useTransform(progress, [0, 0.92, 1], [1, 1, 0]);
  const ringOpacity = useTransform(progress, [0, 0.9, 1], [1, 1, 0]);

  // Hero: visible from the very start, fade out as logo starts moving
  const heroOpacity = useTransform(progress, [0, 0.24, 0.32], [1, 1, 0]);
  const heroY = useTransform(progress, [0, 0.24, 0.32], [0, 0, -40]);

  // Vision: appears after logo settles on the right, holds, then fades
  const visionOpacity = useTransform(progress, [0.36, 0.42, 0.56, 0.62], [0, 1, 1, 0]);
  const visionY = useTransform(progress, [0.36, 0.42, 0.56, 0.62], [40, 0, 0, -40]);

  // About: appears after logo settles back on the left, holds, then fades
  const aboutOpacity = useTransform(progress, [0.66, 0.72, 0.88, 0.94], [0, 1, 1, 0]);
  const aboutY = useTransform(progress, [0.66, 0.72, 0.88, 0.94], [40, 0, 0, -40]);

  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative w-full"
      style={{ height: "700vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* 3D logo layer — compact box matching logo footprint, moves with scroll */}
        <motion.div
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            x: logoX,
            scale: logoScale,
            opacity: logoOpacity,
            width: "min(440px, 55vh)",
            height: "min(440px, 55vh)",
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          {/* White ring — exactly the size of the logo box */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1.5px solid rgba(180,255,225,0.75)",
              boxShadow:
                "0 0 180px 30px rgba(29,158,117,0.55), 0 0 80px 10px rgba(93,202,165,0.4), inset 0 0 80px rgba(93,202,165,0.18)",
              opacity: ringOpacity,
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(93,202,165,0.18) 0%, rgba(29,158,117,0.06) 50%, transparent 75%)",
            }}
          />
          <div className="absolute inset-0">
            <Canvas camera={{ position: [0, 0, 4], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <Scene />
            </Canvas>
          </div>
        </motion.div>

        {/* Panel 1 — Hero (logo LEFT → text RIGHT, far edge) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 right-[2.5vw] max-w-[46vw] z-10 pointer-events-none"
          style={{ opacity: heroOpacity, y: heroY, background: "transparent" }}
        >
          <span
            className="inline-block mb-6 px-4 py-1.5 rounded-full border"
            style={{
              borderColor: "rgba(29,158,117,0.35)",
              color: "#5DCAA5",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 13,
              letterSpacing: 5,
              background: "transparent",
            }}
          >
            ETQAN AGENCY
          </span>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(56px, 8vw, 120px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "hsl(var(--foreground))" }}>نصنع الـ </span>
            <span
              style={{
                color: "#1D9E75",
                textShadow: "0 0 45px rgba(29,158,117,0.55)",
              }}
            >
              إتقان
            </span>
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'El Messiri', 'Tajawal', sans-serif",
              fontWeight: 500,
              fontSize: "clamp(22px, 2.6vw, 40px)",
              color: "hsl(var(--foreground) / 0.9)",
              lineHeight: 1.4,
            }}
          >
            في كل تفصيل رقمي
          </p>
          <p
            className="mb-8"
            style={{
              fontFamily: "'Tajawal', 'El Messiri', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(15px, 1.4vw, 20px)",
              color: "hsl(var(--foreground) / 0.72)",
              lineHeight: 1.9,
              maxWidth: "40vw",
            }}
          >
            حيث تلتقي الرؤية بالإبداع. نحن وكالة تصميم تركز على بناء تجارب رقمية
            تترك أثراً، مدمجين الفن بالتكنولوجيا لتحقيق الكمال.
          </p>
          <div className="flex items-center gap-4 pointer-events-auto" style={{ direction: "rtl" }}>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-medium transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1D9E75, #2ec48f)",
                color: "#04201a",
                fontFamily: "'El Messiri', sans-serif",
                fontSize: 17,
                boxShadow: "0 10px 30px -8px rgba(29,158,117,0.6)",
              }}
            >
              ابدأ مشروعك
            </a>
            <a
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-medium transition-all hover:bg-white/5"
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                color: "hsl(var(--foreground))",
                fontFamily: "'El Messiri', sans-serif",
                fontSize: 17,
              }}
            >
              أعمالنا
              <span aria-hidden>←</span>
            </a>
          </div>
        </motion.div>

        {/* Panel 2 — رؤيتنا (logo RIGHT → text LEFT, far edge) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[46vw] z-10 pointer-events-none"
          style={{ opacity: visionOpacity, y: visionY, background: "transparent" }}
        >
          <span
            className="inline-block mb-6 px-4 py-1.5 rounded-full border"
            style={{
              borderColor: "rgba(29,158,117,0.35)",
              color: "#5DCAA5",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 13,
              letterSpacing: 5,
              background: "transparent",
            }}
          >
            01 — VISION
          </span>
          <h2
            className="mb-8"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(56px, 8.5vw, 120px)",
              color: "#1D9E75",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textShadow: "0 0 45px rgba(29,158,117,0.45)",
            }}
          >
            رؤيتنا
          </h2>
          <p
            style={{
              fontFamily: "'Tajawal', 'El Messiri', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(18px, 1.9vw, 28px)",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.85,
            }}
          >
            أن نكون الوكالة الرائدة في صناعة العلامات التجارية والتسويق الرقمي،
            نُقدّم تجارب بصرية مُتقنة تجمع بين الإبداع والاحترافية، لنصنع أثراً
            يمتد في السوق السعودي والعربي.
          </p>
        </motion.div>

        {/* Panel 3 — من نحن (logo LEFT → text RIGHT, far edge) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 right-[2.5vw] max-w-[46vw] z-10 pointer-events-none"
          style={{ opacity: aboutOpacity, y: aboutY, background: "transparent" }}
        >
          <span
            className="inline-block mb-6 px-4 py-1.5 rounded-full border"
            style={{
              borderColor: "rgba(200,168,75,0.4)",
              color: "#C8A84B",
              fontFamily: "'Cairo', sans-serif",
              fontSize: 13,
              letterSpacing: 5,
              background: "transparent",
            }}
          >
            02 — ABOUT
          </span>
          <h2
            className="mb-8"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(56px, 8.5vw, 120px)",
              color: "#1D9E75",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              textShadow: "0 0 45px rgba(29,158,117,0.45)",
            }}
          >
            من نحن
          </h2>
          <p
            style={{
              fontFamily: "'Tajawal', 'El Messiri', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(18px, 1.9vw, 28px)",
              color: "hsl(var(--foreground) / 0.85)",
              lineHeight: 1.85,
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
