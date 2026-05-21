import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import aboutWho from "@/assets/about-who.png";
import aboutVision from "@/assets/about-vision.png";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import Hero from "@/components/Hero";
import ServicesShowcase3D from "@/components/ServicesShowcase3D";
import PortfolioMarquee from "@/components/PortfolioMarquee";
import PartnersMarquee from "@/components/PartnersMarquee";
import { CinematicHero } from "@/components/ui/cinematic-hero";
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

      <CinematicHero />

      {/* About teaser - من نحن & رؤيتنا */}
      <section className="px-6 py-24 max-w-7xl mx-auto space-y-12" dir="rtl">
        {/* من نحن */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-10 items-center glass-strong rounded-3xl p-8 lg:p-12"
        >
          <div className="text-right order-2 lg:order-1">
            <p className="text-sm text-primary tracking-widest mb-4">نبذة عنّا</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              <span className="text-gradient">من نحن</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              وكالة إتقان هي وكالة دعاية وإعلان متخصصة في تقديم خدمات الإعلان والتصميم والتسويق الرقمي
              بأعلى مستوى من الدقة والاحترافية. نرسم لعلامتك التجارية خطوطها العريضة بناءً على دراسة معمّقة
              للسوق والمنافسين، ونبدأ معك من البداية بتحديد الجدوى من المشروع واختيار الوسائل الإعلانية
              الأكثر تأثيراً، لنعمل جاهدين على تحقيق كافة الأهداف التي تطمح إليها علامتك.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
              {t.common.learnMore} <Arrow className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center order-1 lg:order-2">
            <img
              src={aboutWho}
              alt="وكالة إتقان - من نحن"
              loading="lazy"
              width={1024}
              height={832}
              className="w-full max-w-md"
            />
          </div>
        </motion.div>

        {/* رؤيتنا */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-10 items-center glass-strong rounded-3xl p-8 lg:p-12"
        >
          <div className="flex items-center justify-center">
            <img
              src={aboutVision}
              alt="وكالة إتقان - رؤيتنا"
              loading="lazy"
              width={1024}
              height={832}
              className="w-full max-w-md"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-primary tracking-widest mb-4">إلى أين نتجه</p>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">
              <span className="text-gradient">رؤيتنا</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              تسعى وكالة إتقان لأن تكون الشريك الأول للمؤسسات والشركات في رحلة نموّها، عبر تقديم حلول
              إعلانية وتسويقية مبتكرة وقادرة على تحقيق أهداف علامتك بأذكى الطرق وأكثرها تأثيراً، لنصنع
              معاً قصص نجاح حقيقية تستحق أن تُروى.
            </p>
            <Link to="/contact" className="inline-flex items-center gap-2 mt-6 text-primary font-bold hover:gap-3 transition-all">
              تواصل معنا <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Partners */}
      <PartnersMarquee />

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

    </>
  );
}
