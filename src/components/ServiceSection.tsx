import { Canvas } from "@react-three/fiber";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Service } from "@/lib/services";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  service: Service;
  Scene: React.LazyExoticComponent<React.ComponentType<{ hovered: boolean }>>;
  index: number;
};

export default function ServiceSection({ service, Scene, index }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const reverse = index % 2 === 1;

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "200px 0px" }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(textRef.current!.querySelectorAll("[data-anim]"), {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={service.id}
      className="snap-start min-h-screen w-full flex items-center py-20 px-4 sm:px-8 lg:px-16 relative"
    >
      <div className={`mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? "lg:[direction:ltr]" : ""}`}>
        {/* Text */}
        <div ref={textRef} className="space-y-6 lg:[direction:rtl]">
          <div data-anim className="inline-flex items-center gap-3 glass rounded-full px-4 py-2 text-sm">
            <span className="text-gradient font-black text-lg">{service.number}</span>
            <span className="text-muted-foreground">{service.tagline}</span>
          </div>
          <h2 data-anim className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            <span className="text-gradient">{service.title}</span>
          </h2>
          <p data-anim className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            {service.description}
          </p>
          <ul data-anim className="grid sm:grid-cols-3 gap-3 pt-2">
            {service.bullets.map((b) => (
              <li key={b} className="glass rounded-xl px-4 py-3 text-sm text-center">
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* 3D scene */}
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={{ scale: 1.02 }}
          className="relative h-[55vh] lg:h-[70vh] rounded-3xl overflow-hidden glass shadow-elegant lg:[direction:rtl]"
        >
          <div className="absolute inset-0">
            {inView && (
              <Suspense fallback={<div className="w-full h-full animate-pulse bg-white/5" />}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
                  <Scene hovered={hovered} />
                </Canvas>
              </Suspense>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
