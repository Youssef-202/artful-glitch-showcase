import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function AccountMgmt3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bars = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    if (group.current) {
      const target = hovered ? 0.7 : 0.2;
      group.current.rotation.y += dt * target;
    }
    barRefs.current.forEach((m, i) => {
      if (!m) return;
      const h = 0.6 + Math.abs(Math.sin(state.clock.elapsedTime * 1.2 + i * 0.7)) * 1.6;
      m.scale.y += (h - m.scale.y) * 0.1;
      m.position.y = m.scale.y / 2 - 0.6;
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <pointLight position={[-3, 2, -2]} color="#3565F5" intensity={2.5} />
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <group ref={group}>
          {/* dashboard panel */}
          <mesh position={[0, 0, -0.6]}>
            <boxGeometry args={[4, 2.4, 0.1]} />
            <meshStandardMaterial color="#0d1530" metalness={0.6} roughness={0.3} emissive="#0a1a4a" emissiveIntensity={0.3} />
          </mesh>
          {/* bars */}
          <group position={[-1.4, 0, 0]}>
            {bars.map((i) => (
              <mesh key={i} ref={(el) => (barRefs.current[i] = el)} position={[i * 0.55, 0, 0]}>
                <boxGeometry args={[0.32, 1, 0.32]} />
                <meshStandardMaterial color="#3565F5" emissive="#3565F5" emissiveIntensity={0.6} />
              </mesh>
            ))}
          </group>
          {/* floating dots */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[Math.cos(i) * 2.3, Math.sin(i * 1.3) * 1.2, 0.4 + Math.sin(i) * 0.3]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color="#8aa6ff" />
            </mesh>
          ))}
        </group>
      </Float>
    </>
  );
}
