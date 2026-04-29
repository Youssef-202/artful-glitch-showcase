import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function AdsCampaign3D({ hovered }: { hovered: boolean }) {
  const mega = useRef<THREE.Group>(null);
  const stream = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const t = Math.random();
      arr[i * 3] = 0.8 + t * 3;
      arr[i * 3 + 1] = (Math.random() - 0.5) * (0.4 + t * 1.6);
      arr[i * 3 + 2] = (Math.random() - 0.5) * (0.4 + t * 1.6);
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (mega.current) {
      mega.current.rotation.y += dt * (hovered ? 0.7 : 0.25);
    }
    if (stream.current) {
      const arr = stream.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] += dt * 1.5;
        if (arr[i] > 4) arr[i] = 0.8;
      }
      stream.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 4]} intensity={1.2} />
      <pointLight position={[-2, 1, 2]} color="#3565F5" intensity={2.5} />
      <Float speed={1.3} rotationIntensity={0.4} floatIntensity={0.7}>
        <group ref={mega} position={[-1, 0, 0]} rotation={[0, 0, -0.3]}>
          {/* megaphone cone */}
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.4, 0, 0]}>
            <coneGeometry args={[0.9, 1.6, 32, 1, true]} />
            <meshStandardMaterial color="#3565F5" emissive="#3565F5" emissiveIntensity={0.4} metalness={0.7} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {/* handle */}
          <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.8, 24]} />
            <meshStandardMaterial color="#1a2350" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </Float>
      {/* data stream */}
      <points ref={stream}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#8aa6ff" transparent opacity={0.9} />
      </points>
    </>
  );
}
