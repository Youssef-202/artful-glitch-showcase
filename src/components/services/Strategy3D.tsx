import { Float, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Strategy3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = -2.5 + t * 5;
      const y = -1.2 + Math.pow(t, 1.6) * 2.6 + Math.sin(t * 6) * 0.15;
      pts.push([x, y, 0]);
    }
    return pts;
  }, []);

  const nodes = useMemo(() => points.filter((_, i) => i % 10 === 0), [points]);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * (hovered ? 0.5 : 0.15);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 4]} color="#8aa6ff" intensity={2} />
      <pointLight position={[-3, -2, 3]} color="#3565F5" intensity={2} />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <group ref={group}>
          {/* grid */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Line key={`h${i}`} points={[[-2.5, -1.2 + i * 0.7, 0], [2.5, -1.2 + i * 0.7, 0]]} color="#1a2350" lineWidth={1} />
          ))}
          {/* growth curve */}
          <Line points={points} color="#3565F5" lineWidth={3} />
          {/* nodes */}
          {nodes.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#8aa6ff" emissive="#3565F5" emissiveIntensity={1} />
            </mesh>
          ))}
          {/* arrow head */}
          <mesh position={points[points.length - 1]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.18, 0.4, 16]} />
            <meshStandardMaterial color="#3565F5" emissive="#3565F5" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </Float>
    </>
  );
}
