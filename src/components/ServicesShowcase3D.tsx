import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRef, MouseEvent } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { services } from "@/lib/services";

function ServiceCard3D({ s, i, dir }: { s: typeof services[number]; i: number; dir: "rtl" | "ltr" }) {
  const { t } = useLang();
  const tr = t.services[s.id as keyof typeof t.services];
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const ref = useRef<HTMLAnchorElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 150, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [0, 1], [12, -12]);
  const rotateY = useTransform(sx, [0, 1], [-14, 14]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
    >
      <Link
        ref={ref}
        to={`/services/${s.id}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative block h-full rounded-3xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative h-full rounded-3xl overflow-hidden border border-teal-900/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition-shadow duration-500 group-hover:shadow-[0_20px_60px_-10px_rgba(3,108,95,0.9)]"
        >
          {/* aurora gradient ring */}
          <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(3,108,95,0), rgba(6,95,70,0.6), rgba(4,120,87,0.7), rgba(3,108,95,0))" }} />
          <div className="relative h-full rounded-3xl bg-gradient-to-br from-[#022e29] via-[#03332d] to-[#01211d] backdrop-blur-xl overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden" style={{ transform: "translateZ(30px)" }}>
              <motion.img
                src={s.image}
                alt={tr.title}
                loading="lazy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.12 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/40 to-transparent" />
              {/* Number badge */}
              <div
                className="absolute top-4 left-4 flex items-center gap-2"
                style={{ transform: "translateZ(60px)" }}
              >
                <span className="relative inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 text-white font-black text-base shadow-[0_0_20px_rgba(3,108,95,0.6)]">
                  {s.number}
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-teal-400/50 animate-pulse-ring" />
                </span>
              </div>
              {/* Sparkle */}
              <Sparkles
                className="absolute top-4 right-4 w-4 h-4 text-teal-300 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-180"
                style={{ transform: "translateZ(50px)" }}
              />
            </div>

            {/* Content */}
            <div
              className="relative p-5 pt-4"
              style={{ transform: "translateZ(40px)" }}
            >
              <h3 className="text-lg font-black mb-1 text-white">
                {tr.title}
              </h3>
              <p className="text-sm text-teal-100/80 line-clamp-2 mb-3">{tr.tagline}</p>
              <span className="inline-flex items-center gap-1.5 text-teal-300 text-sm font-bold transition-all duration-300 group-hover:gap-3">
                {t.common.learnMore}
                <Arrow className="w-3.5 h-3.5" />
              </span>
              {/* underline accent */}
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
            </div>

            {/* Glare */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
              style={{
                background: useTransform(
                  [glareX, glareY] as any,
                  ([x, y]: any) => `radial-gradient(400px circle at ${x} ${y}, rgba(52,211,153,0.45), transparent 50%)`
                ),
              }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function ServicesShowcase3D() {
  const { t, dir } = useLang();
  return (
    <section className="relative px-6 py-24 max-w-7xl mx-auto">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h2 className="text-center mb-4 text-gradient font-sans font-extrabold leading-tight font-mono bg-slate-800 font-bold sm:text-5xl pb-[11px] text-2xl">
          <span className="text-gradient font-sans font-extrabold text-white text-7xl font-semibold">{t.nav.services}</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((s, i) => (
          <ServiceCard3D key={s.id} s={s} i={i} dir={dir} />
        ))}
      </div>
    </section>
  );
}
