import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Interactive space background — starfield + nebula + mouse-reactive parallax.
 * Stars twinkle, gently drift, and are pushed/pulled by the cursor.
 */

function Starfield({ isLight }: { isLight: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const count = useMemo(() => (window.innerWidth < 768 ? 1200 : 3000), []);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const { positions, originals, sizes, colors, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    const palette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#a5f3fc"),
      new THREE.Color("#5eead4"),
      new THREE.Color("#c4b5fd"),
      new THREE.Color("#fbcfe8"),
    ];
    for (let i = 0; i < count; i++) {
      // distribute in a deep slab in front of camera
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 40 - 2;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      orig[i * 3] = x; orig[i * 3 + 1] = y; orig[i * 3 + 2] = z;
      // depth-based size: closer => bigger
      const depth = 1 - (-z) / 42;
      sz[i] = 0.5 + Math.pow(depth, 2) * 2.5 + Math.random() * 0.8;
      const c = palette[(Math.random() * palette.length) | 0];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, originals: orig, sizes: sz, colors: col, phases: ph };
  }, [count]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    // smooth mouse
    mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;

    // parallax: shift group based on mouse
    ref.current.position.x = mouse.current.x * 1.2;
    ref.current.position.y = mouse.current.y * 0.8;
    ref.current.rotation.z += dt * 0.005;

    const t = state.clock.elapsedTime;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const szArr = (ref.current.geometry.attributes.size as THREE.BufferAttribute).array as Float32Array;

    // mouse world position approx
    const mxW = mouse.current.x * viewport.width * 0.5;
    const myW = mouse.current.y * viewport.height * 0.5;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const ox = originals[ix], oy = originals[ix + 1], oz = originals[ix + 2];
      // gentle drift
      const drift = Math.sin(t * 0.2 + phases[i]) * 0.15;
      let nx = ox + drift;
      let ny = oy + Math.cos(t * 0.18 + phases[i]) * 0.15;

      // mouse repulsion for nearer stars
      if (oz > -18) {
        const dx = nx - mxW;
        const dy = ny - myW;
        const d2 = dx * dx + dy * dy;
        const radius2 = 25;
        if (d2 < radius2) {
          const f = (1 - d2 / radius2) * 1.8;
          nx += (dx / Math.sqrt(d2 + 0.001)) * f;
          ny += (dy / Math.sqrt(d2 + 0.001)) * f;
        }
      }

      arr[ix] = nx;
      arr[ix + 1] = ny;
      arr[ix + 2] = oz;

      // twinkle
      szArr[i] = sizes[i] * (0.65 + 0.35 * Math.sin(t * 1.5 + phases[i] * 3));
    }
    (ref.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (ref.current.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uOpacity: { value: isLight ? 0.55 : 0.95 } }}
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          uniform float uOpacity;
          void main() {
            vec2 c = gl_PointCoord - vec2(0.5);
            float d = length(c);
            if (d > 0.5) discard;
            float core = smoothstep(0.5, 0.0, d);
            float halo = smoothstep(0.5, 0.2, d) * 0.6;
            float alpha = (core + halo) * uOpacity;
            gl_FragColor = vec4(vColor, alpha);
          }
        `}
      />
    </points>
  );
}

function Nebula({ isLight }: { isLight: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
  });
  return (
    <mesh ref={ref} position={[0, 0, -30]}>
      <planeGeometry args={[120, 80]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uLight: { value: isLight ? 1 : 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime; uniform vec2 uMouse; uniform float uLight;
          // simple fbm
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));vec2 u=f*f*(3.0-2.0*f);return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}
          float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
          void main(){
            vec2 uv = vUv - 0.5;
            uv += uMouse * 0.08;
            float n = fbm(uv * 3.0 + uTime * 0.04);
            float n2 = fbm(uv * 6.0 - uTime * 0.03);
            vec3 c1 = vec3(0.07, 0.55, 0.55);   // teal
            vec3 c2 = vec3(0.45, 0.25, 0.75);   // violet
            vec3 c3 = vec3(0.95, 0.45, 0.65);   // pink
            vec3 col = mix(c1, c2, n);
            col = mix(col, c3, smoothstep(0.5, 0.9, n2) * 0.5);
            float mask = smoothstep(0.8, 0.1, length(uv));
            float alpha = mask * (uLight > 0.5 ? 0.10 : 0.28);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}

function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.15;
      y += (ty - y) * 0.15;
      setPos({ x, y });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity"
      style={{
        background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, hsl(var(--primary) / 0.18), transparent 60%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}

export default function PersistentCanvas() {
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <>
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: isLight
            ? "radial-gradient(1400px 800px at 30% 10%, hsl(176 70% 92%), transparent 60%), radial-gradient(1200px 700px at 80% 90%, hsl(280 70% 94%), transparent 60%), hsl(var(--background))"
            : "radial-gradient(1400px 900px at 20% 10%, hsl(260 60% 12%), transparent 60%), radial-gradient(1200px 800px at 80% 80%, hsl(176 70% 10%), transparent 60%), hsl(var(--background))",
        }} />
        <Canvas
          key={location.pathname}
          camera={{ position: [0, 0, 5], fov: 70 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <Nebula isLight={isLight} />
          <Starfield isLight={isLight} />
        </Canvas>
      </div>
      <CursorGlow />
    </>
  );
}
