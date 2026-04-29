import { lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { services } from "@/lib/services";
import Hero from "@/components/Hero";
import Loader from "@/components/Loader";
import CursorFollower from "@/components/CursorFollower";
import FloatingCTA from "@/components/FloatingCTA";
import ParticleBackground from "@/components/ParticleBackground";
import ServiceSection from "@/components/ServiceSection";

const sceneMap = {
  account: lazy(() => import("@/components/services/AccountMgmt3D")),
  photo: lazy(() => import("@/components/services/Photography3D")),
  content: lazy(() => import("@/components/services/Content3D")),
  strategy: lazy(() => import("@/components/services/Strategy3D")),
  ads: lazy(() => import("@/components/services/AdsCampaign3D")),
  web: lazy(() => import("@/components/services/WebDev3D")),
  design: lazy(() => import("@/components/services/GraphicDesign3D")),
  brand: lazy(() => import("@/components/services/Branding3D")),
} as const;

const Index = () => {
  useLenis();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    let p = 10;
    const id = setInterval(() => {
      p = Math.min(100, p + 8 + Math.random() * 12);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setLoading(false), 300);
      }
    }, 180);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Loader progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>

      <ParticleBackground />
      <CursorFollower />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: loading ? 0 : 0.2 }}
        className="relative w-full snap-y-mandatory lg-snap-off overflow-y-auto"
      >
        <Hero />

        {/* About bridge */}
        <section className="snap-start min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-3xl text-center glass-strong rounded-3xl p-10">
            <p className="text-sm text-primary tracking-widest mb-4">من نحن</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-6">
              <span className="text-gradient">إبداعٌ بمعايير عالمية</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              في [اسم الشركة]، نحن فريق من المصممين والمسوّقين والمطوّرين، نؤمن أن العلامات العظيمة
              تُبنى بالتفاصيل. نقدّم ٨ خدمات متكاملة تحت سقفٍ واحد لنوصلكم إلى جمهوركم بأسلوبٍ يخلِّد
              هويتكم.
            </p>
          </div>
        </section>

        {services.map((s, i) => (
          <ServiceSection
            key={s.id}
            service={s}
            index={i}
            Scene={sceneMap[s.id as keyof typeof sceneMap]}
          />
        ))}

        <footer className="snap-start min-h-[40vh] flex flex-col items-center justify-center text-center px-6 py-16 gap-6">
          <h3 className="text-3xl sm:text-5xl font-black">
            <span className="text-gradient">جاهزون لصناعة الأثر؟</span>
          </h3>
          <p className="text-muted-foreground max-w-xl">
            تواصلوا معنا اليوم لنحوّل فكرتكم إلى علامة تجارية تُحَب وتُذكَر.
          </p>
          <a href="https://wa.me/9665XXXXXXXX" target="_blank" rel="noopener noreferrer" className="rounded-full px-8 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
            ابدأ المحادثة
          </a>
          <p className="text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} [اسم الشركة]. جميع الحقوق محفوظة.</p>
        </footer>
      </motion.main>

      <FloatingCTA />
    </>
  );
};

export default Index;
