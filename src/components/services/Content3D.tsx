import { Float, Text3D, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Content3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const letters = useMemo(() => ["A", "B", "C", "&", "#", "@", "Z", "x"], []);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * (hovered ? 0.6 : 0.2);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.3} />
      <pointLight position={[-3, -2, 2]} color="#3565F5" intensity={2} />
      {/* keyboard base */}
      <mesh position={[0, -1.4, 0]} receiveShadow>
        <boxGeometry args={[4.5, 0.2, 1.6]} />
        <meshStandardMaterial color="#0d1530" metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = (i % 8) * 0.5 - 1.75;
        const z = Math.floor(i / 8) * 0.5 - 0.5;
        return (
          <mesh key={i} position={[x, -1.25, z]}>
            <boxGeometry args={[0.42, 0.12, 0.42]} />
            <meshStandardMaterial color={i % 5 === 0 ? "#3565F5" : "#1a2350"} emissive={i % 5 === 0 ? "#3565F5" : "#000"} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      {/* floating letters */}
      <group ref={group}>
        {letters.map((c, i) => (
          <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.6} floatIntensity={1.4}>
            <Center position={[Math.cos(i) * 1.6, 0.3 + Math.sin(i) * 0.6, Math.sin(i) * 1.2]}>
              <Text3D font="/fonts/helvetiker_regular.typeface.json" size={0.45} height={0.12} curveSegments={6} bevelEnabled bevelSize={0.015} bevelThickness={0.02} fallback={<mesh><boxGeometry args={[0.4, 0.4, 0.12]} /><meshStandardMaterial color="#3565F5" emissive="#3565F5" emissiveIntensity={0.6} /></mesh>}>
                {c}
                <meshStandardMaterial color="#3565F5" emissive="#3565F5" emissiveIntensity={0.5} metalness={0.6} roughness={0.2} />
              </Text3D>
            </Center>
          </Float>
        ))}
      </group>
    </>
  );
}
