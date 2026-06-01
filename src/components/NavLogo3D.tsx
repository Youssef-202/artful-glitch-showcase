import { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import logo3d from "@/assets/etqan-logo-3d.png";

function Mesh() {
  const texture = useLoader(THREE.TextureLoader, logo3d);
  const ref = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    texture.anisotropy = 16;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [texture]);

  const aspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
  const w = 2.4;
  const h = w / aspect;

  useFrame(() => {
    if (!ref.current) return;
    const ty = mouse.current.x * 0.6;
    const tx = -mouse.current.y * 0.4;
    ref.current.rotation.y += (ty - ref.current.rotation.y) * 0.08;
    ref.current.rotation.x += (tx - ref.current.rotation.x) * 0.08;
  });

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          metalness={0.6}
          roughness={0.25}
          emissive={new THREE.Color("#5fd9cf")}
          emissiveMap={texture}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

export default function NavLogo3D({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#5fd9cf" />
        <Mesh />
      </Canvas>
    </div>
  );
}
