import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Clock,
  Tag,
  ChevronDown,
  ListChecks,
  Workflow,
  Gift,
  HelpCircle,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import RequestServiceButton from "@/components/RequestServiceButton";

type ServiceRow = {
  id: string;
  number: string;
  title: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  bullets: string[];
  features: string[];
  process_steps: string[];
  deliverables: string[];
  reasons: string[];
  faqs: { q: string; a: string }[];
  price_from: number | null;
  currency: string;
  duration: string | null;
  sort_order: number;
};

export default function ServiceDetail() {
  const { id } = useParams();
  const { t, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [service, setService] = useState<ServiceRow | null>(null);
  const [siblings, setSiblings] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      supabase.from("services").select("*").eq("id", id).eq("published", true).maybeSingle(),
      supabase
        .from("services")
        .select("id,number,title,tagline,description,image_url,long_description,bullets,features,process_steps,deliverables,faqs,price_from,currency,duration,sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
    ]).then(([one, all]) => {
      setService((one.data as any) ?? null);
      setSiblings(((all.data as any) ?? []) as ServiceRow[]);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="px-6 max-w-6xl mx-auto py-12 h-96 animate-pulse" />;
  }
  if (!service) return <Navigate to="/services" replace />;

  const idx = siblings.findIndex((s) => s.id === service.id);
  const prev = siblings[(idx - 1 + (siblings.length || 1)) % (siblings.length || 1)];
  const next = siblings[(idx + 1) % (siblings.length || 1)];

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(service.title)}`;
  const sd = (t as any).serviceDetail;

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
          {service.image_url && (
            <img
              src={service.image_url}
              alt={service.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-end p-6 sm:p-12">
            <div className="text-right max-w-2xl space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-accent font-black text-lg">{service.number}</p>
              <h1 className="text-4xl sm:text-6xl font-black text-foreground leading-tight">
                {service.title}
              </h1>
              {service.tagline && (
                <p className="text-xl text-foreground/80">{service.tagline}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8" dir={dir}>
        {/* SIDEBAR */}
        <aside className="space-y-6 lg:order-1">
          {/* Availability */}
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="font-bold text-foreground">متاحة الآن للطلب</span>
          </div>

          {/* Service info card */}
          <div className="rounded-2xl border border-primary/40 bg-card/30 p-6 space-y-4">
            <h3 className="font-black text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              ملخص الخدمة
            </h3>
            {service.duration && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" /> المدة
                </span>
                <span className="font-bold">{service.duration}</span>
              </div>
            )}
            {service.price_from != null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground inline-flex items-center gap-2">
                  <Tag className="w-4 h-4" /> السعر يبدأ من
                </span>
                <span className="font-black text-accent">
                  {Number(service.price_from).toLocaleString()} {service.currency}
                </span>
              </div>
            )}
            {service.bullets.length > 0 && (
              <ul className="space-y-2 pt-2 border-t border-border/40">
                {service.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/40 bg-card/30 p-6 space-y-3">
            <h3 className="font-black text-lg">جاهز نبدأ معاك؟</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              اطلب الخدمة دلوقتي وفريقنا هيتواصل معاك في خلال 24 ساعة.
            </p>
            <RequestServiceButton
              serviceKey={service.id}
              serviceNameAr={service.title}
              serviceNameEn={service.title}
            />
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

        {/* CONTENT */}
        <div className="lg:col-span-2 space-y-6 lg:order-2">
          {/* Overview */}
          <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
            <h2 className="font-black text-xl flex items-center gap-2 mb-3">
              <span className="w-1 h-6 bg-accent rounded-full" />
              نظرة عامة
            </h2>
            <p className="text-muted-foreground leading-loose whitespace-pre-wrap">
              {service.long_description || service.description}
            </p>
          </section>

          {/* Features */}
          {service.features.length > 0 && (
            <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5">
                <ListChecks className="w-5 h-5 text-accent" />
                المزايا
              </h2>
              <div className="space-y-3">
                {service.features.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 + i * 0.05 }}
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
          )}

          {/* Process */}
          {service.process_steps.length > 0 && (
            <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5">
                <Workflow className="w-5 h-5 text-accent" />
                خطوات التنفيذ
              </h2>
              <ol className="relative border-s border-primary/30 ps-6 space-y-5">
                {service.process_steps.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[33px] top-0 w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground font-black text-sm flex items-center justify-center shadow-glow">
                      {i + 1}
                    </span>
                    <p className="text-foreground/90 leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Deliverables */}
          {service.deliverables.length > 0 && (
            <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5">
                <Gift className="w-5 h-5 text-accent" />
                هتحصل على
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {service.deliverables.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background/30 px-4 py-3"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </span>
                    <span className="text-sm text-foreground/90">{d}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {service.faqs && service.faqs.length > 0 && (
            <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5">
                <HelpCircle className="w-5 h-5 text-accent" />
                أسئلة شائعة
              </h2>
              <div className="space-y-2">
                {service.faqs.map((f, i) => (
                  <div key={i} className="rounded-xl border border-primary/30 bg-background/30 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-right hover:bg-foreground/5"
                    >
                      <span className="font-bold">{f.q}</span>
                      <ChevronDown className={`w-4 h-4 transition ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-loose whitespace-pre-wrap">
                        {f.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Why choose */}
          {sd?.reasons && (
            <section className="rounded-2xl border border-primary/40 bg-card/30 p-6">
              <h2 className="font-black text-xl flex items-center gap-2 mb-5">
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
          )}

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <RequestServiceButton
              serviceKey={service.id}
              serviceNameAr={service.title}
              serviceNameEn={service.title}
            />
            <Link
              to="/contact"
              className="rounded-full px-6 py-3 font-bold border border-primary/40 hover:bg-primary/10 transition"
            >
              {t.common.ctaContact}
            </Link>
          </div>
        </div>
      </div>

      {/* prev / next */}
      {siblings.length > 1 && prev && next && (
        <div className="grid grid-cols-2 gap-4 mt-12">
          <Link
            to={`/services/${prev.id}`}
            className="rounded-2xl border border-primary/30 bg-card/30 p-5 hover:border-accent transition group"
          >
            <p className="text-xs text-muted-foreground mb-1">← {prev.number}</p>
            <p className="font-bold group-hover:text-accent transition">{prev.title}</p>
          </Link>
          <Link
            to={`/services/${next.id}`}
            className="rounded-2xl border border-primary/30 bg-card/30 p-5 hover:border-accent transition group text-right"
          >
            <p className="text-xs text-muted-foreground mb-1">{next.number} →</p>
            <p className="font-bold group-hover:text-accent transition">{next.title}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
