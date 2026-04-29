import { Float, RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

const codeLines = [
  "<header>",
  "  <h1>أهلاً</h1>",
  "</header>",
  "const x = 42;",
  "build();",
];

export default function WebDev3D({ hovered }: { hovered: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (codeLines.length + 1)), 700);
    return () => clearInterval(id);
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hovered ? 0.4 : 0.15;
    group.current.rotation.y += dt * target;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <pointLight position={[-3, -2, 2]} color="#115e59" intensity={2} />
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <group ref={group}>
          {/* browser frame */}
          <RoundedBox args={[4, 2.6, 0.15]} radius={0.12} smoothness={4}>
            <meshStandardMaterial color="#08302d" metalness={0.6} roughness={0.3} />
          </RoundedBox>
          {/* top bar */}
          <mesh position={[0, 1.05, 0.08]}>
            <planeGeometry args={[4, 0.5]} />
            <meshBasicMaterial color="#0d3633" />
          </mesh>
          {/* dots */}
          {[-1.7, -1.5, -1.3].map((x, i) => (
            <mesh key={i} position={[x, 1.05, 0.09]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color={["#ff5f57", "#febc2e", "#28c840"][i]} />
            </mesh>
          ))}
          {/* screen */}
          <mesh position={[0, -0.15, 0.08]}>
            <planeGeometry args={[3.7, 1.9]} />
            <meshBasicMaterial color="#04201e" />
          </mesh>
          {/* code lines */}
          {codeLines.slice(0, step).map((line, i) => (
            <Text key={i} position={[-1.7, 0.55 - i * 0.32, 0.1]} fontSize={0.18} color="#5fd9cf" anchorX="left" anchorY="middle">
              {line}
            </Text>
          ))}
          {/* cursor */}
          <mesh position={[-1.7 + step * 0.05, 0.55 - Math.min(step, codeLines.length - 1) * 0.32, 0.1]}>
            <planeGeometry args={[0.05, 0.22]} />
            <meshBasicMaterial color="#115e59" />
          </mesh>
        </group>
      </Float>
    </>
  );
}
