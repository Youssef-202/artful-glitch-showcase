import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function LoaderSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * 0.6;
    ref.current.rotation.y += dt * 0.9;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.1, 1]} />
      <meshBasicMaterial color="#115e59" wireframe />
    </mesh>
  );
}

export default function Loader({ progress = 0 }: { progress?: number }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-radial-primary opacity-60 pointer-events-none" />
      <div className="w-40 h-40">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.6} />
          <LoaderSphere />
        </Canvas>
      </div>
      <p className="mt-4 text-sm text-muted-foreground tracking-widest">جاري التحميل...</p>
      <div className="mt-3 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
        />
      </div>
    </div>
  );
}
