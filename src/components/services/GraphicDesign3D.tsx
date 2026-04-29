import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const palette = ["#3565F5", "#8aa6ff", "#f55b8a", "#f5c63a", "#3af5b8"];

export default function GraphicDesign3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pen = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (group.current) {
      group.current.rotation.y += dt * (hovered ? 0.6 : 0.25);
    }
    if (pen.current) {
      const t = state.clock.elapsedTime;
      pen.current.position.x = Math.cos(t * 0.6) * 1.6;
      pen.current.position.y = Math.sin(t * 0.9) * 0.9;
      pen.current.rotation.z = -t * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 4]} intensity={1.3} />
      <pointLight position={[-2, -2, 3]} color="#3565F5" intensity={2} />
      <group ref={group}>
        {palette.map((c, i) => {
          const angle = (i / palette.length) * Math.PI * 2;
          return (
            <Float key={c} speed={1 + i * 0.3} rotationIntensity={0.5} floatIntensity={1}>
              <mesh position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.0, 0]}>
                <sphereGeometry args={[0.55, 48, 48]} />
                <MeshDistortMaterial color={c} distort={0.35} speed={2 + i * 0.2} roughness={0.15} metalness={0.4} emissive={c} emissiveIntensity={0.25} />
              </mesh>
            </Float>
          );
        })}
        {/* pen tool */}
        <mesh ref={pen}>
          <coneGeometry args={[0.15, 0.6, 16]} />
          <meshStandardMaterial color="#fff" metalness={0.9} roughness={0.1} emissive="#3565F5" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </>
  );
}
