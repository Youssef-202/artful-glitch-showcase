import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic horizon hero — three.js starfield + nebula + parallax mountains.
 * Colors are pinned to the project's teal/accent palette.
 */
export const HorizonHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const [isReady, setIsReady] = useState(false);

  const threeRefs = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    composer: EffectComposer | null;
    stars: THREE.Points[];
    nebula: THREE.Mesh | null;
    mountains: THREE.Mesh[];
    locations: number[];
    animationId: number | null;
    targetCameraX?: number;
    targetCameraY?: number;
    targetCameraZ?: number;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    locations: [],
    animationId: null,
  });

  useEffect(() => {
    const refs = threeRefs.current;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const getSize = () => ({ w: section.clientWidth, h: section.clientHeight });

    // Scene
    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x06201d, 0.00045);

    const { w, h } = getSize();
    refs.camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000);
    refs.camera.position.set(0, 30, 100);

    refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    refs.renderer.setSize(w, h);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.55;

    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.9, 0.5, 0.82);
    refs.composer.addPass(bloom);

    // STARFIELD — teal / mint / white palette
    const createStarField = () => {
      const starCount = window.innerWidth < 768 ? 1800 : 4000;
      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          const color = new THREE.Color();
          const pick = Math.random();
          if (pick < 0.65) color.setHSL(0, 0, 0.85 + Math.random() * 0.15); // white
          else if (pick < 0.9) color.setHSL(0.48, 0.6, 0.7); // teal
          else color.setHSL(0.53, 0.5, 0.75); // mint
          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;
          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 }, depth: { value: i } },
          vertexShader: `
            attribute float size; attribute vec3 color;
            varying vec3 vColor; uniform float time; uniform float depth;
            void main() {
              vColor = color; vec3 pos = position;
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              vec4 mv = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float o = 1.0 - smoothstep(0.0, 0.5, d);
              gl_FragColor = vec4(vColor, o);
            }`,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene!.add(stars);
        refs.stars.push(stars);
      }
    };

    // NEBULA — teal -> accent gradient
    const createNebula = () => {
      const geometry = new THREE.PlaneGeometry(8000, 4000, 80, 80);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x0e7c70) }, // deep teal
          color2: { value: new THREE.Color(0x5fd9cf) }, // mint
          opacity: { value: 0.35 },
        },
        vertexShader: `
          varying vec2 vUv; varying float vE; uniform float time;
          void main() {
            vUv = uv; vec3 pos = position;
            float e = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += e; vE = e;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
          varying vec2 vUv; varying float vE;
          void main() {
            float m = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 c = mix(color1, color2, m * 0.5 + 0.5);
            float a = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            a *= 1.0 + vE * 0.01;
            gl_FragColor = vec4(c, a);
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      refs.scene!.add(nebula);
      refs.nebula = nebula;
    };

    // MOUNTAIN LAYERS — dark teal palette
    const createMountains = () => {
      const layers = [
        { distance: -50, height: 60, color: 0x041f1c, opacity: 1 },
        { distance: -100, height: 80, color: 0x062d29, opacity: 0.85 },
        { distance: -150, height: 100, color: 0x0a3f3a, opacity: 0.6 },
        { distance: -200, height: 120, color: 0x0e564f, opacity: 0.4 },
      ];
      layers.forEach((layer, index) => {
        const points: THREE.Vector2[] = [];
        const segments = 50;
        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y =
            Math.sin(i * 0.1) * layer.height +
            Math.sin(i * 0.05) * layer.height * 0.5 +
            Math.random() * layer.height * 0.2 -
            100;
          points.push(new THREE.Vector2(x, y));
        }
        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
        });
        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene!.add(mountain);
        refs.mountains.push(mountain);
      });
      refs.locations = refs.mountains.map((m) => m.position.z);
    };

    // ATMOSPHERIC GLOW
    const createAtmosphere = () => {
      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec3 vNormal; uniform float time;
          void main() {
            float i = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atm = vec3(0.20, 0.75, 0.70) * i;
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atm *= pulse;
            gl_FragColor = vec4(atm, i * 0.28);
          }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      refs.scene!.add(new THREE.Mesh(geometry, material));
    };

    createStarField();
    createNebula();
    createMountains();
    createAtmosphere();

    // Animation loop
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      refs.stars.forEach((s) => {
        const mat = s.material as THREE.ShaderMaterial;
        if (mat.uniforms) mat.uniforms.time.value = time;
      });
      if (refs.nebula) {
        const mat = refs.nebula.material as THREE.ShaderMaterial;
        if (mat.uniforms) mat.uniforms.time.value = time * 0.5;
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const s = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX! - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y += (refs.targetCameraY! - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z += (refs.targetCameraZ! - smoothCameraPos.current.z) * s;
        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;
        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((m, i) => {
        const p = 1 + i * 0.5;
        m.position.x = Math.sin(time * 0.1) * 2 * p;
        m.position.y = 50 + Math.cos(time * 0.15) * 1 * p;
      });

      refs.composer?.render();
    };
    animate();
    setIsReady(true);

    // Resize
    const handleResize = () => {
      if (!refs.camera || !refs.renderer || !refs.composer || !section) return;
      const { w, h } = getSize();
      refs.camera.aspect = w / h;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(w, h);
      refs.composer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener("resize", handleResize);
      refs.stars.forEach((s) => {
        s.geometry.dispose();
        (s.material as THREE.Material).dispose();
      });
      refs.mountains.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        (refs.nebula.material as THREE.Material).dispose();
      }
      refs.renderer?.dispose();
    };
  }, []);

  // Intro GSAP animation
  useEffect(() => {
    if (!isReady) return;
    const tl = gsap.timeline();
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll(".title-char");
      tl.from(chars, { y: 160, opacity: 0, duration: 1.4, stagger: 0.06, ease: "power4.out" });
    }
    if (subtitleRef.current) {
      tl.from(subtitleRef.current.querySelectorAll(".subtitle-line"), {
        y: 40, opacity: 0, duration: 0.9, stagger: 0.18, ease: "power3.out",
      }, "-=0.7");
    }
    if (ctaRef.current) {
      tl.from(ctaRef.current, { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
    }
    if (scrollHintRef.current) {
      tl.from(scrollHintRef.current, { opacity: 0, y: 20, duration: 0.8, ease: "power2.out" }, "-=0.4");
    }
    return () => { tl.kill(); };
  }, [isReady]);

  // Scroll-driven camera (only while hero is in view)
  useEffect(() => {
    const handleScroll = () => {
      const refs = threeRefs.current;
      const section = sectionRef.current;
      if (!section || !refs.camera) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight + window.innerHeight;
      const passed = Math.min(Math.max(window.innerHeight - rect.top, 0), total);
      const progress = Math.min(passed / total, 1);

      const positions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 45, z: -100 },
      ];
      const i = progress < 0.5 ? 0 : 0;
      const t = progress;
      const a = positions[0];
      const b = positions[1];
      refs.targetCameraX = a.x + (b.x - a.x) * t;
      refs.targetCameraY = a.y + (b.y - a.y) * t;
      refs.targetCameraZ = a.z + (b.z - a.z) * t;

      refs.mountains.forEach((m, i) => {
        const speed = 1 + i * 0.6;
        const targetZ = m.userData.baseZ + window.scrollY * speed * 0.35;
        m.userData.targetZ = targetZ;
        m.position.z = targetZ;
      });
      void i;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const splitTitle = (text: string) =>
    Array.from(text).map((ch, i) => (
      <span key={i} className="title-char inline-block">
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] min-h-[640px] overflow-hidden -mt-24"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Vignette + gradient overlay tying canvas to site palette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,transparent,hsl(var(--background)/0.6))]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pt-24">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs tracking-[0.3em] text-primary mb-8 border border-primary/30">
          <Sparkles className="w-3.5 h-3.5" />
          ITQAN · CREATIVE STUDIO
        </div>

        <h1
          ref={titleRef}
          className="font-black leading-[0.9] text-[clamp(3.5rem,11vw,9rem)] tracking-tight"
        >
          <span className="text-gradient font-sans font-extrabold block">{splitTitle("إتقان")}</span>
        </h1>

        <div ref={subtitleRef} className="mt-6 space-y-1 max-w-2xl">
          <p className="subtitle-line text-base sm:text-xl text-foreground/85">
            حيث تلتقي الرؤية بالإبداع
          </p>
          <p className="subtitle-line text-sm sm:text-base text-muted-foreground">
            نصمّم هويات بصرية وتجارب رقمية تترك أثراً يدوم.
          </p>
        </div>

        <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
          >
            تواصل معنا <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold glass border border-primary/30 hover:border-primary/60 transition"
          >
            خدماتنا
          </Link>
        </div>

        <div
          ref={scrollHintRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-muted-foreground"
        >
          <span>SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-primary/70 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HorizonHero;
