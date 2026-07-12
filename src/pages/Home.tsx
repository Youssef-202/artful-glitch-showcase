import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import aboutWho from "@/assets/about-who.png";
import aboutVision from "@/assets/about-vision.png";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import ArchitecturalHero from "@/components/ui/architectural-hero";
import PartnersLogoCloud from "@/components/PartnersLogoCloud";
import ServicesShowcase3D from "@/components/ServicesShowcase3D";
import PortfolioStack from "@/components/PortfolioStack";
import Reveal from "@/components/ui/reveal";

import { CinematicFooter } from "@/components/ui/motion-footer";
import { services } from "@/lib/services";
import { supabase } from "@/integrations/supabase/external";
import { usePortfolio } from "@/lib/usePortfolio";

export default function Home() {
  const { t, lang, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [posts, setPosts] = useState<any[]>([]);
  const { items: portfolio } = usePortfolio();

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
      <ArchitecturalHero />

      {/* Partners logo cloud */}
      <Reveal><PartnersLogoCloud /></Reveal>

      {/* Services grid */}
      <Reveal><ServicesShowcase3D /></Reveal>

      {/* Portfolio showcase */}
      <Reveal><PortfolioStack /></Reveal>




      {/* Blog teaser */}
      <Reveal>
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-primary tracking-widest mb-3">{t.blog.kicker}</p>
            <h2 className="text-3xl sm:text-5xl font-black"><span className="text-gradient text-slate-50">{t.blog.title}</span></h2>
          </div>
          {posts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {posts.map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/blog/${p.id}`} className="group block rounded-2xl overflow-hidden h-full border border-teal-900/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_60px_-10px_rgba(3,108,95,0.9)] hover:-translate-y-1 transition-all bg-gradient-to-br from-[#022e29] via-[#03332d] to-[#01211d]">
                    {p.cover_url ? (
                      <div className="aspect-video overflow-hidden bg-background/40">
                        <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-black text-gradient">{p.category?.[0] ?? "✦"}</span>
                      </div>
                    )}
                    <div className="p-5 text-white">
                      {p.category && <span className="inline-block text-xs text-teal-300 tracking-widest mb-2">{p.category}</span>}
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 pb-0 text-white">{p.title}</h3>
                      {p.excerpt && <p className="text-sm text-white/80 line-clamp-2">{p.excerpt}</p>}
                      <div className="flex items-center gap-1 mt-3 text-xs text-white/70">
                        {/* Date hidden as requested */}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
          <div className="text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
              {t.common.viewAll} <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </Reveal>

    </>
  );
}
