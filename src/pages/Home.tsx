import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import Hero from "@/components/Hero";
import { services } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const { t, lang, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("blog_posts")
      .select("id,title,excerpt,cover_url,category,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  return (
    <>
      <Hero />

      {/* About teaser */}
      <section className="px-6 py-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl text-center glass-strong rounded-3xl p-10"
        >
          <p className="text-sm text-primary tracking-widest mb-4">{t.about.kicker}</p>
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            <span className="text-gradient">{t.about.title}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{t.about.body}</p>
          <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
            {t.common.learnMore} <Arrow className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Services grid */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm text-primary tracking-widest mb-3">{t.common.ourServices}</p>
          <h2 className="text-3xl sm:text-5xl font-black"><span className="text-gradient">{t.nav.services}</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => {
            const tr = t.services[s.id as keyof typeof t.services];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              >
                <Link
                  to={`/services/${s.id}`}
                  className="group block glass rounded-2xl overflow-hidden h-full hover:shadow-glow hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-background/40">
                    <img src={s.image} alt={tr.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                    <span className="absolute top-3 left-3 text-gradient font-black text-xl">{s.number}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1">{tr.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tr.tagline}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                      {t.common.learnMore} <Arrow className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Portfolio teaser */}
      <section className="px-6 py-24 max-w-7xl mx-auto text-center">
        <p className="text-sm text-primary tracking-widest mb-3">{t.common.ourWork}</p>
        <h2 className="text-3xl sm:text-5xl font-black mb-6">
          <span className="text-gradient">{t.portfolio.title}</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">{t.portfolio.subtitle}</p>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
        >
          {t.common.viewAll} <Arrow className="w-4 h-4" />
        </Link>
      </section>

      <footer className="px-6 py-16 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t.common.brand}. {t.common.allRights}
        </p>
      </footer>
    </>
  );
}
