import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Persistent 3D background that lives across the whole app.
 * - Animated particle field that morphs based on the current route.
 * - Reacts to mouse position (subtle parallax + ripple) without a custom cursor.
 * - Reacts to light/dark theme.
 */

function ParticleField({ routeKey, isLight }: { routeKey: string; isLight: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const count = useMemo(() => (window.innerWidth < 768 ? 700 : 1800), []);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const { positions, originals } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      orig[i * 3] = x; orig[i * 3 + 1] = y; orig[i * 3 + 2] = z;
    }
    return { positions: pos, originals: orig };
  }, [count]);

  const morphTarget = useRef(0);
  const morphCurrent = useRef(0);
  useEffect(() => {
    let h = 0;
    for (let i = 0; i < routeKey.length; i++) h = (h * 31 + routeKey.charCodeAt(i)) >>> 0;
    morphTarget.current = (h % 1000) / 1000;
  }, [routeKey]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.04;
    ref.current.rotation.x += dt * 0.012;

    // subtle parallax from mouse
    const targetRotY = mouse.current.x * 0.25;
    const targetRotX = mouse.current.y * 0.15;
    ref.current.rotation.y += (targetRotY - (ref.current.rotation.y % (Math.PI * 2))) * 0.0015;
    ref.current.rotation.x += (targetRotX - ref.current.rotation.x) * 0.02;

    morphCurrent.current += (morphTarget.current - morphCurrent.current) * 0.04;
    const m = morphCurrent.current;
    const t = state.clock.elapsedTime;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const ox = originals[ix], oy = originals[ix + 1], oz = originals[ix + 2];
      const wave = Math.sin(t * 0.5 + (ox + oy + oz) * 0.15) * (0.4 + m * 0.8);
      arr[ix] = ox + Math.sin(t * 0.3 + i) * 0.05 * (1 + m);
      arr[ix + 1] = oy + wave * 0.15;
      arr[ix + 2] = oz + Math.cos(t * 0.3 + i) * 0.05 * (1 + m);
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={isLight ? 0.04 : 0.05}
        color={isLight ? "#115e59" : "#5fd9cf"}
        transparent
        opacity={isLight ? 0.55 : 0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function PersistentCanvas() {
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-radial-primary" />
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={isLight ? 0.6 : 0.3} />
        <ParticleField routeKey={location.pathname} isLight={isLight} />
      </Canvas>
    </div>
  );
}
