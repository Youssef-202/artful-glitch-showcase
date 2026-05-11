import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import Hero from "@/components/Hero";
import ServicesShowcase3D from "@/components/ServicesShowcase3D";
import { services } from "@/lib/services";
import { supabase } from "@/integrations/supabase/client";
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
      <Hero />

      {/* About teaser */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-10 items-center glass-strong rounded-3xl p-8 lg:p-12"
        >
          <div className={dir === "rtl" ? "text-right" : "text-left"}>
            <p className="text-sm text-primary tracking-widest mb-4">نبذة عن إتقان</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              <span className="text-gradient">من الفكرة إلى واقع حقيقي</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              في إتقان، ما ننفّذ مجرد طلب عادي. نحن نفهم أن كل مشروع له قصة، وكل فكرة لها إمكانيات لا محدودة.
              لذا نجلس معك أولاً، نستمع، نسأل، ندرس السوق والمنافسة والفرص المتاحة. من هناك، ننسج خطة متقنة
              تجمع بين الإبداع في التصميم والذكاء في التسويق. كل تصميم نصنعه، كل كلمة نكتبها، كل استراتيجية
              نضعها - كلها تصب في هدف واحد واضح: إطلاق مشروعك بقوة حقيقية في السوق.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
              {t.common.learnMore} <Arrow className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="https://etqanagency.com/assets/Comp-CNuNSmaD.gif"
              alt="إتقان - من الفكرة إلى واقع حقيقي"
              loading="lazy"
              className="w-full max-w-md rounded-2xl"
            />
          </div>
        </motion.div>
      </section>

      {/* Services grid */}
      <ServicesShowcase3D />

      {/* Portfolio showcase */}
      <PortfolioMarquee />

      {/* Blog teaser */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm text-primary tracking-widest mb-3">{t.blog.kicker}</p>
          <h2 className="text-3xl sm:text-5xl font-black"><span className="text-gradient">{t.blog.title}</span></h2>
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
                <Link to={`/blog/${p.id}`} className="group block glass rounded-2xl overflow-hidden h-full hover:shadow-glow hover:-translate-y-1 transition-all">
                  {p.cover_url ? (
                    <div className="aspect-video overflow-hidden bg-background/40">
                      <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-4xl font-black text-gradient">{p.category?.[0] ?? "✦"}</span>
                    </div>
                  )}
                  <div className="p-5">
                    {p.category && <span className="inline-block text-xs text-primary tracking-widest mb-2">{p.category}</span>}
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />{new Date(p.created_at).toLocaleDateString()}
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

      <footer className="px-6 py-16 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t.common.brand}. {t.common.allRights}
        </p>
      </footer>
    </>
  );
}
