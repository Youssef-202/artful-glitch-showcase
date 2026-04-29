import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function Branding3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pieces = useMemo(
    () => [
      { target: [-0.8, 0.5, 0], geom: "box" as const, color: "#3565F5" },
      { target: [0.8, 0.5, 0], geom: "box" as const, color: "#8aa6ff" },
      { target: [-0.8, -0.5, 0], geom: "box" as const, color: "#fff" },
      { target: [0.8, -0.5, 0], geom: "sphere" as const, color: "#3565F5" },
      { target: [0, 0, 0.4], geom: "torus" as const, color: "#8aa6ff" },
    ],
    []
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.y += dt * (hovered ? 0.5 : 0.2);
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const target = pieces[i].target as [number, number, number];
      const offset = Math.max(0, 1 - t / 4);
      const ox = Math.cos(i * 1.7) * 4 * offset;
      const oy = Math.sin(i * 1.3) * 3 * offset;
      const oz = Math.sin(i * 2.1) * 3 * offset;
      m.position.x += (target[0] + ox - m.position.x) * 0.08;
      m.position.y += (target[1] + oy - m.position.y) * 0.08;
      m.position.z += (target[2] + oz - m.position.z) * 0.08;
      m.rotation.x += dt * 0.5;
      m.rotation.y += dt * 0.6;
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 4]} intensity={1.3} />
      <pointLight position={[-3, -2, 3]} color="#3565F5" intensity={2.5} />
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.6}>
        <group ref={group}>
          {pieces.map((p, i) => (
            <mesh key={i} ref={(el) => (refs.current[i] = el)}>
              {p.geom === "box" && <boxGeometry args={[0.7, 0.7, 0.7]} />}
              {p.geom === "sphere" && <sphereGeometry args={[0.45, 32, 32]} />}
              {p.geom === "torus" && <torusGeometry args={[0.5, 0.18, 16, 48]} />}
              <meshStandardMaterial color={p.color} metalness={0.7} roughness={0.2} emissive={p.color} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      </Float>
    </>
  );
}
