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

  // Smoothly follow the scroll-driven target rotation
  useFrame((_, dt) => {
    if (!ref.current || !targetRot) return;
    const target = targetRot.current;
    const current = ref.current.rotation.y;
    ref.current.rotation.y = current + (target - current) * Math.min(1, dt * 6);
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


export default function EtqanHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.6 });

  // Logo stays on the RIGHT throughout, slides further right during the
  // middle section (no ring), then drifts back toward center-right for the
  // final panel (ring on again) — matching the reference choreography.
  const logoX = useTransform(
    progress,
    [0, 0.22, 0.36, 0.58, 0.72, 0.92, 1],
    ["28%", "28%", "44%", "44%", "28%", "28%", "28%"]
  );
  // Scale: normal on Panel 1, GROWS BIG on Panel 2 to fill the right area, then settles on Panel 3
  const logoScale = useTransform(
    progress,
    [0, 0.22, 0.36, 0.48, 0.58, 0.72, 0.92, 1],
    [1, 1, 1.35, 1.6, 1.6, 1.15, 1.05, 0.95]
  );
  const logoOpacity = useTransform(progress, [0, 0.92, 1], [1, 1, 0]);

  // Ring: bright on Panel 1, FADES OUT during Panel 2, FADES BACK IN on Panel 3
  const ringOpacity = useTransform(
    progress,
    [0, 0.24, 0.34, 0.6, 0.72, 0.92, 1],
    [1, 1, 0, 0, 1, 1, 0]
  );

  // Panel 1 (hero): visible from start
  const heroOpacity = useTransform(progress, [0, 0.24, 0.32], [1, 1, 0]);
  const heroY = useTransform(progress, [0, 0.24, 0.32], [0, 0, -40]);

  // Panel 2 (specs/vision): three stacked rows on the LEFT
  const visionOpacity = useTransform(progress, [0.36, 0.42, 0.56, 0.62], [0, 1, 1, 0]);
  const visionY = useTransform(progress, [0.36, 0.42, 0.56, 0.62], [40, 0, 0, -40]);

  // Panel 3 (about): big title LEFT + two small paragraphs on the RIGHT
  const aboutOpacity = useTransform(progress, [0.66, 0.72, 0.88, 0.94], [0, 1, 1, 0]);
  const aboutY = useTransform(progress, [0.66, 0.72, 0.88, 0.94], [40, 0, 0, -40]);

  // Scroll-driven rotation target for the 3D logo (radians around Y).
  // Panel 1 → front, Panel 2 → ~3/4 turn, Panel 3 → ~5/4 turn.
  const rotationMV = useTransform(progress, [0, 1], [Math.PI / 2, Math.PI / 2 + Math.PI * 2]);
  const rotationRef = useRef(Math.PI / 2);
  useMotionValueEvent(rotationMV, "change", (v) => {
    rotationRef.current = v;
  });


  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative w-full border-0"
      style={{ height: "700vh" }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* 3D logo layer — stays on the right, ring fades in/out with scroll */}
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
          {/* Ring light — sits behind, logo is centered in front */}
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
          {/* 3D logo — always centered in front of the ring */}
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <RotationCtx.Provider value={rotationRef}>
                <Scene />
              </RotationCtx.Provider>
            </Canvas>
          </div>

        </motion.div>

        {/* Panel 1 — Hero: title on the LEFT (far edge) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[46vw] z-10 pointer-events-none"
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

        {/* Panel 2 — three stacked specs on the LEFT (ring is OFF here) */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] max-w-[46vw] z-10 pointer-events-none space-y-8"
          style={{ opacity: visionOpacity, y: visionY, background: "transparent" }}
        >
          {[
            {
              title: "وكالة إتقان",
              body: "وكالة سعودية متخصصة في التسويق الرقمي والهوية البصرية، نُقدّم حلولاً متكاملة تحاكي طموح العلامات التجارية.",
            },
            {
              title: "+120 مشروع",
              body: "نفّذنا أكثر من مئة مشروع لعلاماتٍ رائدة في السعودية والخليج، من الهوية البصرية إلى الحملات الرقمية المتكاملة.",
            },
            {
              title: "فريق متعدد التخصصات",
              body: "مصمّمون، مطوّرون، صنّاع محتوى ومخططو إعلانات يعملون يداً بيد لصياغة تجاربٍ رقمية لا تُنسى.",
            },
          ].map((item, i) => (
            <div key={i}>
              <h3
                style={{
                  fontFamily: "'El Messiri', 'Reem Kufi', serif",
                  fontWeight: 700,
                  fontSize: "clamp(30px, 3.6vw, 54px)",
                  color: "hsl(var(--foreground))",
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Tajawal', sans-serif",
                  fontWeight: 300,
                  fontSize: "clamp(13px, 1.1vw, 16px)",
                  color: "hsl(var(--foreground) / 0.65)",
                  lineHeight: 1.8,
                  maxWidth: "32vw",
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Panel 3 — big title LEFT + two small paragraphs below-right */}
        <motion.div
          dir="rtl"
          className="absolute top-1/2 -translate-y-1/2 left-[2.5vw] z-10 pointer-events-none"
          style={{ opacity: aboutOpacity, y: aboutY, background: "transparent", width: "62vw" }}
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
            className="mb-10"
            style={{
              fontFamily: "'El Messiri', 'Reem Kufi', serif",
              fontWeight: 700,
              fontSize: "clamp(48px, 6.8vw, 104px)",
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
          <div className="flex gap-10 pointer-events-auto" style={{ direction: "rtl" }}>
            <p
              style={{
                fontFamily: "'Tajawal', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(13px, 1.1vw, 16px)",
                color: "hsl(var(--foreground) / 0.7)",
                lineHeight: 1.9,
                maxWidth: "22vw",
              }}
            >
              في إتقان، نؤمن أن التصميم ليس مجرد شكلٍ جميل بل تجربةٌ تُحرّك المشاعر
              وتبني الثقة. نُتقن التفاصيل لنُقدّم نتائج تتجاوز توقّعات شركائنا.
            </p>
            <p
              style={{
                fontFamily: "'Tajawal', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(13px, 1.1vw, 16px)",
                color: "hsl(var(--foreground) / 0.7)",
                lineHeight: 1.9,
                maxWidth: "22vw",
              }}
            >
              نعمل مع الشركات الناشئة والعلامات الراسخة في السعودية والوطن العربي،
              ونصنع لكلٍّ منها قصةً بصريّةً تليق بها وتُميّزها في سوقها.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
