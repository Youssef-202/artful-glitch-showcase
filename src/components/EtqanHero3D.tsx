import { Suspense, useRef, createContext, useContext, MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useGLTF } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";

// Shared rotation target driven by parent scroll
const RotationCtx = createContext<MutableRefObject<number> | null>(null);

function Model() {
  const ref = useRef<THREE.Group>(null);
  const gltf = useGLTF("/models/etqan.glb");
  const targetRot = useContext(RotationCtx);

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
  const scale = 2.6 / maxDim;

  // Smoothly follow the scroll-driven target rotation (frame-rate independent
  // exponential smoothing — equivalent to GSAP scrub easing).
  useFrame((_, dt) => {
    if (!ref.current || !targetRot) return;
    const target = targetRot.current;
    const current = ref.current.rotation.y;
    const alpha = 1 - Math.exp(-dt * 4.5);
    ref.current.rotation.y = current + (target - current) * alpha;
  });


  return (
    <group ref={ref} rotation={[0, Math.PI / 2, 0]}>
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
      <ambientLight intensity={0.55} />
      {/* Ring light — bright frontal light that mimics the glowing ring reflecting on the logo */}
      <pointLight position={[0, 0, 3.2]} intensity={3.4} color="#B4FFE1" distance={10} decay={1.6} />
      <pointLight position={[1.7, 1.2, 2.4]} intensity={1.9} color="#5DCAA5" distance={9} decay={1.6} />
      <pointLight position={[-1.7, -1.0, 2.4]} intensity={1.7} color="#1D9E75" distance={9} decay={1.6} />
      <pointLight position={[6, 6, 4]} intensity={1.4} color="#1D9E75" />
      <pointLight position={[-6, 2, 3]} intensity={1.0} color="#5DCAA5" />
      <pointLight position={[0, -4, 3]} intensity={0.6} color="#C8A84B" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      <Suspense fallback={null}>
        <Float speed={0} rotationIntensity={0} floatIntensity={0}>
          <Model />
        </Float>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}


// ────────────────────────────────────────────────────────────
// Panel config — 4 sections, smooth scroll-driven choreography
// ────────────────────────────────────────────────────────────
const FRONT = Math.PI / 2 - 0.28; // front-facing, slight left tilt

type Panel = {
  badge: string;
  logoX: string; // % offset from center
  logoScale: number;
  ring: number; // 0..1
  rotation: number; // radians (Y axis)
  align: "left" | "right";
};

const PANELS: Panel[] = [
  // Even 0.6π rotation increments — one continuous, monotonic turn across all 4 panels.
  { badge: "ETQAN AGENCY",   logoX: "28%",  logoScale: 1.00, ring: 1, rotation: FRONT,                  align: "left"  },
  { badge: "01 — ABOUT US",  logoX: "30%",  logoScale: 1.05, ring: 0, rotation: FRONT + Math.PI * 0.60, align: "left"  },
  { badge: "02 — VISION",    logoX: "-26%", logoScale: 1.00, ring: 0, rotation: FRONT + Math.PI * 1.20, align: "right" },
  { badge: "03 — VALUES",    logoX: "28%",  logoScale: 1.00, ring: 1, rotation: FRONT + Math.PI * 1.80, align: "left"  },
];

// Adjacent-hold keyframes — no dead scroll between panels.
// 4 panels × [holdIn, holdOut] = 8 stops. Transitions live at the boundary.
const STOPS = [
  0.00, 0.22,  // Panel 1 hold
  0.28, 0.47,  // Panel 2 hold (transition 0.22→0.28)
  0.53, 0.72,  // Panel 3 hold (transition 0.47→0.53)
  0.78, 1.00,  // Panel 4 hold (transition 0.72→0.78)
];
const TRANSITIONS = [
  [0.22, 0.28], // 1→2
  [0.47, 0.53], // 2→3
  [0.72, 0.78], // 3→4
];
const seriesAt = (vals: number[]): number[] =>
  vals.flatMap((v) => [v, v]);



export default function EtqanHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // Soft, low-stiffness spring → buttery scroll with no jank
  // Scrub-equivalent: very soft spring → motion catches up to scroll smoothly,
  // fast flings settle quickly without overshoot (mimics ScrollTrigger fastScrollEnd).
  const progress = useSpring(scrollYProgress, {
    stiffness: 22,
    damping: 26,
    mass: 0.22,
    restDelta: 0.0005,
  });


  // Logo transforms — driven by the same STOPS array for all panels
  const logoX = useTransform(
    progress,
    STOPS,
    seriesAt(PANELS.map((p) => parseFloat(p.logoX))).map((v) => `${v}%`)
  );
  const logoScale = useTransform(progress, STOPS, seriesAt(PANELS.map((p) => p.logoScale)));
  const ringOpacity = useTransform(progress, STOPS, seriesAt(PANELS.map((p) => p.ring)));

  // Rotation target → smoothly followed inside the Model via useFrame
  const rotationMV = useTransform(progress, STOPS, seriesAt(PANELS.map((p) => p.rotation)));
  const rotationRef = useRef(FRONT);
  useMotionValueEvent(rotationMV, "change", (v) => {
    rotationRef.current = v;
  });

  // Per-panel text fade — fades happen INSIDE the transition band of the
  // adjacent panel, so there's never an overlap or empty-text gap.
  const panelMotion = PANELS.map((_, i) => {
    const inHold = STOPS[i * 2];
    const outHold = STOPS[i * 2 + 1];
    // fadeIn = transition before this panel (or 0 for the first)
    const prevTrans = TRANSITIONS[i - 1];
    const nextTrans = TRANSITIONS[i];
    const fadeIn = prevTrans ? prevTrans[0] : 0;
    const fadeOut = nextTrans ? nextTrans[1] : 1;
    return {
      opacity: useTransform(progress, [fadeIn, inHold, outHold, fadeOut], [0, 1, 1, 0]),
      y: useTransform(progress, [fadeIn, inHold, outHold, fadeOut], [40, 0, 0, -40]),
    };
  });



  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative w-full border-0"
      style={{ height: "720vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* 3D logo layer */}
        <motion.div
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            x: logoX,
            scale: logoScale,
            width: "min(560px, 82vh)",
            height: "min(560px, 82vh)",
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          {/* Ring light */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "8%",
              border: "10px solid rgba(220,255,240,0.95)",
              boxShadow:
                "0 0 60px 6px rgba(220,255,240,0.85), 0 0 200px 40px rgba(29,158,117,0.7), 0 0 110px 18px rgba(93,202,165,0.55), inset 0 0 120px rgba(180,255,225,0.32)",
              opacity: ringOpacity,
              zIndex: 1,
            }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "8%",
              background:
                "radial-gradient(circle, rgba(180,255,225,0.28) 0%, rgba(93,202,165,0.14) 40%, rgba(29,158,117,0.05) 65%, transparent 78%)",
              opacity: ringOpacity,
              zIndex: 1,
            }}
          />
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <RotationCtx.Provider value={rotationRef}>
                <Scene />
              </RotationCtx.Provider>
            </Canvas>
          </div>
        </motion.div>

        {/* Panel 1 — Hero */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[46vw] z-10 pointer-events-none"
          style={{ opacity: panelMotion[0].opacity, y: panelMotion[0].y }}
        >
          <Badge>{PANELS[0].badge}</Badge>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(40px, 5.4vw, 80px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "hsl(var(--foreground))" }}>نصنع الـ </span>
            <span style={{ color: "#1D9E75", textShadow: "0 0 45px rgba(29,158,117,0.55)" }}>
              إتقان
            </span>
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'El Messiri', 'Tajawal', sans-serif",
              fontWeight: 500,
              fontSize: "clamp(16px, 1.7vw, 24px)",
              color: "hsl(var(--foreground) / 0.9)",
              lineHeight: 1.4,
            }}
          >
            في كل تفصيل رقمي
          </p>
          <p
            className="mb-8"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(13px, 1.05vw, 16px)",
              color: "hsl(var(--foreground) / 0.72)",
              lineHeight: 1.9,
              maxWidth: "40vw",
            }}
          >
            حيث تلتقي الرؤية بالإبداع. نحن وكالة تصميم تركز على بناء تجارب رقمية
            تترك أثراً، مدمجين الفن بالتكنولوجيا لتحقيق الكمال.
          </p>
          <div className="flex items-center gap-4 pointer-events-auto">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-medium transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #1D9E75, #2ec48f)",
                color: "#04201a",
                fontFamily: "'El Messiri', sans-serif",
                fontSize: 14,

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
                fontSize: 14,
              }}
            >
              أعمالنا
              <span aria-hidden>←</span>
            </a>
          </div>
        </motion.div>

        {/* Panel 2 — من نحن */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[44vw] z-10 pointer-events-none"
          style={{ opacity: panelMotion[1].opacity, y: panelMotion[1].y }}
        >
          <Badge>{PANELS[1].badge}</Badge>
          <h2
            className="mb-8"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 4.8vw, 72px)",
              color: "#1D9E75",
              textShadow: "0 0 45px rgba(29,158,117,0.45)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            من نحن
          </h2>
          <p
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(13px, 1.05vw, 16px)",
              color: "hsl(var(--foreground) / 0.78)",
              lineHeight: 2,
              maxWidth: "38vw",
            }}
          >
            وكالة سعودية متخصصة في التسويق الرقمي والهوية البصرية. نُقدّم
            حلولاً متكاملة تحاكي طموح العلامات التجارية، ونصنع تجاربَ رقمية
            تترك أثراً حقيقياً في أسواقها.
          </p>
        </motion.div>

        {/* Panel 3 — heading on the RIGHT (logo moves to the LEFT) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 right-[2.5vw] max-w-[46vw] z-10 pointer-events-none text-right"
          style={{ opacity: panelMotion[2].opacity, y: panelMotion[2].y }}
        >
          <Badge>{PANELS[2].badge}</Badge>
          <h2
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 4.4vw, 68px)",
              color: "hsl(var(--foreground))",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            نصنع علاماتٍ
            <br />
            <span style={{ color: "#1D9E75", textShadow: "0 0 45px rgba(29,158,117,0.45)" }}>
              تبقى في الذاكرة
            </span>
          </h2>
        </motion.div>

        {/* Panel 4 — two paragraphs (each on its own line, well-spaced) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[46vw] z-10 pointer-events-none space-y-8"
          style={{ opacity: panelMotion[3].opacity, y: panelMotion[3].y }}
        >
          <Badge>{PANELS[3].badge}</Badge>
          <p
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(13px, 1.05vw, 16px)",

              color: "hsl(var(--foreground) / 0.78)",
              lineHeight: 2,
              maxWidth: "38vw",
            }}
          >
            في إتقان، نؤمن أن التصميم ليس مجرد شكلٍ جميل بل تجربةٌ تُحرّك المشاعر
            وتبني الثقة. نُتقن التفاصيل لنُقدّم نتائج تتجاوز توقّعات شركائنا.
          </p>
          <p
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(13px, 1.05vw, 16px)",
              color: "hsl(var(--foreground) / 0.78)",
              lineHeight: 2,
              maxWidth: "38vw",
            }}
          >
            نعمل مع الشركات الناشئة والعلامات الراسخة في السعودية والوطن العربي،
            ونصنع لكلٍّ منها قصةً بصريّةً تليق بها وتُميّزها في سوقها.
          </p>
        </motion.div>

      </div>
    </section>
  );
}


function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block mb-6 px-4 py-1.5 rounded-full border"
      style={{
        borderColor: "rgba(29,158,117,0.35)",
        color: "#5DCAA5",
        fontFamily: "'Cairo', sans-serif",
        fontSize: 11,
        letterSpacing: 5,
        background: "transparent",
      }}
    >
      {children}
    </span>
  );
}

