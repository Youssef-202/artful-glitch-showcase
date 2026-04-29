import { Float, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Photography3D({ hovered }: { hovered: boolean }) {
  const lens = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!lens.current) return;
    lens.current.rotation.z += dt * (hovered ? 1.2 : 0.4);
    lens.current.rotation.y += dt * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 4, 5]} intensity={1.2} />
      <pointLight position={[0, 0, 3]} color="#3565F5" intensity={3} />
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={lens}>
          {/* outer ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.18, 24, 64]} />
            <meshStandardMaterial color="#1a1f3a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* mid ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}>
            <torusGeometry args={[1.15, 0.12, 24, 64]} />
            <meshStandardMaterial color="#3565F5" metalness={0.8} roughness={0.25} emissive="#3565F5" emissiveIntensity={0.4} />
          </mesh>
          {/* glass */}
          <mesh>
            <cylinderGeometry args={[1, 1, 0.15, 64]} />
            <meshPhysicalMaterial color="#0a1230" transmission={0.4} thickness={0.5} roughness={0.05} metalness={0.2} clearcoat={1} emissive="#3565F5" emissiveIntensity={0.2} />
          </mesh>
          {/* inner aperture */}
          <mesh position={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshStandardMaterial color="#000" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      </Float>
      <Sparkles count={120} scale={5} size={3} speed={0.5} color="#8aa6ff" />
    </>
  );
}
