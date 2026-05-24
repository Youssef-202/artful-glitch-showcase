import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

function Model() {
  const ref = useRef<THREE.Group>(null);
  const gltf = useGLTF("/models/etqan.glb");

  // Apply emerald metallic material to all meshes
  gltf.scene.traverse((obj: any) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0f766e"),
        metalness: 0.95,
        roughness: 0.18,
        emissive: new THREE.Color("#1D9E75"),
        emissiveIntensity: 0.25,
      });
    }
  });

  // Auto-center & scale model
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.6 / maxDim;

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * ((Math.PI * 2) / 20); // 20s/rev
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

export default function EtqanHero3D() {
  return (
    <section
      dir="rtl"
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #0a0e1a 0%, #000000 70%)",
      }}
    >
      {/* White circle behind logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] rounded-full pointer-events-none"
        style={{
          width: "min(520px, 70vw)",
          height: "min(520px, 70vw)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 120px 20px rgba(29,158,117,0.25)",
        }}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.35} />
          <pointLight position={[6, 6, 4]} intensity={2.2} color="#1D9E75" />
          <pointLight position={[-6, 2, 3]} intensity={1.4} color="#5DCAA5" />
          <pointLight position={[0, -4, 3]} intensity={0.8} color="#C8A84B" />
          <directionalLight position={[0, 5, 5]} intensity={0.6} color="#ffffff" />

          <Suspense fallback={null}>
            <Float speed={1.2} rotationIntensity={0} floatIntensity={0.6}>
              <Model />
            </Float>
            <Environment preset="city" />
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Text below */}
      <div className="relative z-10 mt-auto mb-[12vh] flex flex-col items-center text-center px-6 pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
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
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-3 font-light"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize: "clamp(16px, 2.4vw, 24px)",
            color: "#5DCAA5",
          }}
        >
          في إتقان نصنع من رؤيتك حقيقة
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-50">
        <div
          className="w-[1px] h-14"
          style={{
            background: "linear-gradient(to bottom, #1D9E75, transparent)",
          }}
        />
      </div>
    </section>
  );
}
