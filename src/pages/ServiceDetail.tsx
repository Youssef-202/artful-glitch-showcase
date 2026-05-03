import { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/lib/services";
import { useLang } from "@/i18n/LanguageProvider";

gsap.registerPlugin(ScrollTrigger);

export default function ServiceDetail() {
  const { id } = useParams();
  const { t, dir } = useLang();
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.id === id);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-anim]", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [id]);

  if (!service) return <Navigate to="/services" replace />;

  const Scene = sceneMap[service.id as keyof typeof sceneMap];
  const tr = t.services[service.id as keyof typeof t.services];
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const idx = services.findIndex((s) => s.id === service.id);
  const prev = services[(idx - 1 + services.length) % services.length];
  const next = services[(idx + 1) % services.length];

  return (
    <div ref={sectionRef} className="px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8">
        <Arrow className="w-4 h-4 rotate-180" /> {t.nav.services}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div data-anim className="inline-flex items-center gap-3 glass rounded-full px-4 py-2 text-sm">
            <span className="text-gradient font-black text-lg">{service.number}</span>
            <span className="text-muted-foreground">{tr.tagline}</span>
          </div>
          <h1 data-anim className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            <span className="text-gradient">{tr.title}</span>
          </h1>
          <p data-anim className="text-lg text-muted-foreground leading-relaxed">{tr.description}</p>
          <ul data-anim className="space-y-3 pt-2">
            {tr.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 glass rounded-xl px-4 py-3 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <div data-anim className="flex flex-wrap gap-3 pt-4">
            <Link to="/contact" className="rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
              {t.common.ctaStart}
            </Link>
            <Link to="/portfolio" className="rounded-full px-6 py-3 font-bold glass-strong hover:bg-foreground/5 transition">
              {t.common.ourWork}
            </Link>
          </div>
        </div>

        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={{ scale: 1.02, rotateY: dir === "rtl" ? -4 : 4 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative h-[55vh] lg:h-[70vh] rounded-3xl overflow-hidden glass shadow-elegant"
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
          <img
            src={service.image}
            alt={tr.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </div>

      {/* prev / next */}
      <div className="grid grid-cols-2 gap-4 mt-20 mb-12">
        <Link to={`/services/${prev.id}`} className="glass rounded-2xl p-5 hover:shadow-glow transition group">
          <p className="text-xs text-muted-foreground mb-1">← {prev.number}</p>
          <p className="font-bold group-hover:text-primary transition">{t.services[prev.id as keyof typeof t.services].title}</p>
        </Link>
        <Link to={`/services/${next.id}`} className="glass rounded-2xl p-5 hover:shadow-glow transition group text-right">
          <p className="text-xs text-muted-foreground mb-1">{next.number} →</p>
          <p className="font-bold group-hover:text-primary transition">{t.services[next.id as keyof typeof t.services].title}</p>
        </Link>
      </div>
    </div>
  );
}
