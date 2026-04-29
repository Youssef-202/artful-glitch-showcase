import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Content3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const blocks = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({
      pos: [Math.cos(i * 0.7) * 1.7, 0.4 + Math.sin(i * 1.1) * 0.7, Math.sin(i * 0.6) * 1.2] as [number, number, number],
      scale: 0.25 + (i % 3) * 0.08,
      color: i % 3 === 0 ? "#3565F5" : i % 3 === 1 ? "#8aa6ff" : "#ffffff",
    })),
    []
  );

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * (hovered ? 0.7 : 0.25);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.3} />
      <pointLight position={[-3, -2, 2]} color="#3565F5" intensity={2} />

      {/* keyboard base */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[4.5, 0.2, 1.6]} />
        <meshStandardMaterial color="#0d1530" metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = (i % 8) * 0.5 - 1.75;
        const z = Math.floor(i / 8) * 0.5 - 0.5;
        const accent = i % 5 === 0;
        return (
          <mesh key={i} position={[x, -1.25, z]}>
            <boxGeometry args={[0.42, 0.12, 0.42]} />
            <meshStandardMaterial color={accent ? "#3565F5" : "#1a2350"} emissive={accent ? "#3565F5" : "#000"} emissiveIntensity={accent ? 0.6 : 0} />
          </mesh>
        );
      })}

      {/* floating "letter" blocks */}
      <group ref={group}>
        {blocks.map((b, i) => (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.8} floatIntensity={1.4}>
            <mesh position={b.pos}>
              <boxGeometry args={[b.scale, b.scale * 1.4, b.scale * 0.4]} />
              <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.4} metalness={0.5} roughness={0.25} />
            </mesh>
          </Float>
        ))}
      </group>
    </>
  );
}
