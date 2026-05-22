import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Target, Award, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageProvider";
import logoDark from "@/assets/logo.png";
import logo3d from "@/assets/etqan-logo-3d.png";

/**
 * Modern bento-grid hero — replaces the old 3D-canvas intro.
 * Asymmetric tiles, soft glow, AR/RTL aware.
 */
export default function HeroBento() {
  const { t, dir } = useLang();

  const tile =
    "relative glass rounded-3xl border border-border/40 overflow-hidden group hover:border-primary/50 hover:shadow-glow transition-all";

  return (
    <section dir={dir} className="relative px-4 sm:px-6 pt-10 pb-16">
      {/* ambient gradient blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-[520px] h-[520px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-40 -left-20 w-[420px] h-[420px] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass border border-border/50 px-4 py-1.5 text-xs sm:text-sm tracking-widest text-primary font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            وكالة إتقان · ETQAN STUDIO
          </span>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-6 auto-rows-[110px] sm:auto-rows-[140px] gap-3 sm:gap-4">
          {/* Big headline tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className={`${tile} col-span-6 md:col-span-4 row-span-3 md:row-span-3 p-6 sm:p-10 flex flex-col justify-between`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-70" />
            <div className="relative">
              <p className="text-xs sm:text-sm text-primary tracking-[0.3em] font-bold mb-4">
                STUDIO · 2026
              </p>
              <h1 className="font-black leading-[1.05] text-4xl sm:text-6xl lg:text-7xl">
                نصمم{" "}
                <span className="text-gradient">حضوراً</span>
                <br />
                يستحقّ أن يُروى.
              </h1>
              <p className="mt-5 text-sm sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t.common.heroSubtitle}
              </p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 mt-6">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
              >
                {t.common.ctaStart}
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold glass-strong hover:bg-foreground/5 transition"
              >
                <Play className="w-3.5 h-3.5" /> {t.common.ctaExplore}
              </Link>
            </div>
          </motion.div>

          {/* Logo tile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className={`${tile} col-span-3 md:col-span-2 row-span-2 flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 to-accent/10`}
          >
            <img src={logoDark} alt={t.common.brand} className="block dark:hidden max-h-[140px] sm:max-h-[180px] w-auto object-contain drop-shadow-[0_0_20px_hsl(var(--primary)/0.4)]" />
            <img src={logo3d} alt={t.common.brand} className="hidden dark:block max-h-[140px] sm:max-h-[180px] w-auto object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]" />
          </motion.div>

          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`${tile} col-span-3 md:col-span-2 row-span-1 p-4 sm:p-5 flex items-center justify-between`}
          >
            <div>
              <p className="text-2xl sm:text-3xl font-black text-gradient">+120</p>
              <p className="text-xs text-muted-foreground">مشروع منجز</p>
            </div>
            <Award className="w-7 h-7 text-primary/70" />
          </motion.div>

          {/* Feature tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className={`${tile} col-span-3 md:col-span-2 row-span-1 p-4 sm:p-5 flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">سرعة في التنفيذ</p>
              <p className="text-xs text-muted-foreground">دون تنازل عن الجودة</p>
            </div>
          </motion.div>

          {/* Feature tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className={`${tile} col-span-3 md:col-span-2 row-span-1 p-4 sm:p-5 flex items-center gap-3`}
          >
            <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">استراتيجية بنتائج</p>
              <p className="text-xs text-muted-foreground">تركيز على ROI</p>
            </div>
          </motion.div>

          {/* Tagline tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className={`${tile} col-span-3 md:col-span-2 row-span-1 p-4 sm:p-5 flex items-center justify-center text-center bg-gradient-to-tr from-primary/10 to-transparent`}
          >
            <p className="font-bold text-sm sm:text-base">
              <span className="text-gradient">إتقان</span> · حيث الفكرة تلتقي بالأثر
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
