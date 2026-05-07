import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, MessageCircle, Megaphone, Image as ImageIcon, FileEdit, Target, Code, Palette, Award } from "lucide-react";
import { services } from "@/lib/services";
import { useLang } from "@/i18n/LanguageProvider";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  account: MessageCircle,
  photo: ImageIcon,
  content: FileEdit,
  strategy: Target,
  ads: Megaphone,
  web: Code,
  design: Palette,
  brand: Award,
};

const stats = [
  { key: "satisfaction", value: 98, suffix: "%" },
  { key: "projectsDone", value: 150, suffix: "+", display: "+150" },
  { key: "deliverySpeed", value: 100, suffix: "%" },
] as const;

export default function ServiceDetail() {
  const { id } = useParams();
  const { t, dir } = useLang();
  const service = services.find((s) => s.id === id);
  if (!service) return <Navigate to="/services" replace />;

  const tr = t.services[service.id as keyof typeof t.services];
  const sd = (t as any).serviceDetail;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Icon = iconMap[service.id] ?? Sparkles;

  const idx = services.findIndex((s) => s.id === service.id);
  const prev = services[(idx - 1 + services.length) % services.length];
  const next = services[(idx + 1) % services.length];

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(tr.title)}`;

  return (
    <div className="px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto pb-20">
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
      >
        <Arrow className="w-4 h-4 rotate-180" /> {t.nav.services}
      </Link>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden border border-primary/40 shadow-elegant"
      >
        <div className="relative aspect-[16/6] min-h-[260px]">
          <img
            src={service.image}
            alt={tr.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-end p-6 sm:p-12">
            <div className="text-right max-w-2xl space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-glow">
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-foreground leading-tight">
                {tr.title}
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8" dir={dir}>
        {/* LEFT (sidebar) - in rtl this appears on the right side */}
        <aside className="space-y-6 lg:order-1">
          {/* Available */}
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-bold text-foreground">{sd.available}</span>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-primary/40 bg-card/30 p-6 space-y-5">
            <h3 className="font-black text-lg text-foreground flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              {sd.stats}
            </h3>
            {stats.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">{sd[s.key]}</span>
                  <span className="font-black text-accent">{(s as any).display ?? `${s.value}${s.suffix}`}</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(s.value, 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Need help */}
          <div className="rounded-2xl border border-primary/40 bg-card/30 p-6 space-y-4">
            <h3 className="font-black text-lg text-foreground">{sd.needHelp}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{sd.needHelpDesc}</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="block text-center w-full rounded-xl border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 px-4 py-3 font-bold transition"
            >
              {t.common.ctaWhatsapp}
            </a>
          </div>
        </aside>

        {/* RIGHT (content) */}
        <div className="lg:col-span-2 space-y-6 lg:order-2">
          {/* Overview */}
          <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
            <h2 className="font-black text-xl text-foreground flex items-center gap-2 mb-3">
              <span className="w-1 h-6 bg-accent rounded-full" />
              {sd.overview}
            </h2>
            <p className="text-muted-foreground leading-loose">{tr.description}</p>
          </section>

          {/* Features */}
          <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
            <h2 className="font-black text-xl text-foreground flex items-center gap-2 mb-5">
              <span className="w-1 h-6 bg-accent rounded-full" />
              {sd.features}
            </h2>
            <div className="space-y-3">
              {tr.bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-4 rounded-xl border border-primary/30 bg-background/30 p-4"
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-accent/20 text-accent font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-foreground/90 leading-relaxed pt-1">{b}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why choose */}
          <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
            <h2 className="font-black text-xl text-foreground flex items-center gap-2 mb-5">
              <span className="w-1 h-6 bg-accent rounded-full" />
              {sd.whyChoose}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sd.reasons.map((r: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background/30 px-4 py-3"
                >
                  <span className="shrink-0 w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent-foreground" />
                  </span>
                  <span className="text-sm text-foreground/90">{r}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
            >
              {t.common.ctaStart}
            </Link>
            <Link
              to="/portfolio"
              className="rounded-full px-6 py-3 font-bold border border-primary/40 hover:bg-primary/10 transition"
            >
              {t.common.ourWork}
            </Link>
          </div>
        </div>
      </div>

      {/* prev / next */}
      <div className="grid grid-cols-2 gap-4 mt-12">
        <Link to={`/services/${prev.id}`} className="rounded-2xl border border-primary/30 bg-card/30 p-5 hover:border-accent transition group">
          <p className="text-xs text-muted-foreground mb-1">← {prev.number}</p>
          <p className="font-bold group-hover:text-accent transition">
            {t.services[prev.id as keyof typeof t.services].title}
          </p>
        </Link>
        <Link to={`/services/${next.id}`} className="rounded-2xl border border-primary/30 bg-card/30 p-5 hover:border-accent transition group text-right">
          <p className="text-xs text-muted-foreground mb-1">{next.number} →</p>
          <p className="font-bold group-hover:text-accent transition">
            {t.services[next.id as keyof typeof t.services].title}
          </p>
        </Link>
      </div>
    </div>
  );
}
