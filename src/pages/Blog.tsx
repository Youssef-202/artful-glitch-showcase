import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/external";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";

type Post = {
  id: string;
  title: string;
  title_en: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  cover_url: string | null;
  cover_url_light?: string | null;
  title_color_light?: string | null;
  author_name: string | null;
  author_name_en: string | null;
  category: string | null;
  category_en: string | null;
  reading_time: number | null;
  featured: boolean | null;
  created_at: string;
};

type PageContent = { kicker?: string; title?: string; subtitle?: string; cover_url?: string };

export default function Blog() {
  const { t, dir, lang } = useLang();
  const isEn = lang === "en";
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from("blog_posts") as any)
      .select("id,title,title_en,excerpt,excerpt_en,cover_url,author_name,author_name_en,category,category_en,reading_time,featured,created_at")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }: any) => {
        setPosts((data as any) ?? []);
        setLoading(false);
      });
    (supabase.from as any)("site_pages").select("content").eq("page_key", "blog").maybeSingle()
      .then(({ data }: any) => { if (data?.content) setPage(data.content as PageContent); });
  }, []);

  const pick = (ar: string | null, en: string | null) => (isEn && en ? en : ar) ?? "";

  return (
    <div className="px-6 max-w-7xl mx-auto">
      {page.cover_url && (
        <img src={page.cover_url} alt="" className="w-full max-h-72 object-cover rounded-3xl mb-8 shadow-elegant" />
      )}
      <header className="text-center mb-12">
        <p className="text-sm text-primary tracking-widest mb-3">{page.kicker || t.blog.kicker}</p>
        <h1 className="text-4xl sm:text-6xl font-black mb-4">
          <span className="text-gradient">{page.title || t.blog.title}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{page.subtitle || t.blog.subtitle}</p>
      </header>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">{t.blog.empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {posts.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/blog/${p.id}`}
                className="group block glass rounded-2xl overflow-hidden h-full hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                {(() => {
                  const title = pick(p.title, p.title_en);
                  const excerpt = pick(p.excerpt, p.excerpt_en);
                  const category = pick(p.category, p.category_en);
                  const author = pick(p.author_name, p.author_name_en);
                  return (
                    <>
                      {p.cover_url ? (
                        <div className="aspect-video overflow-hidden bg-background/40">
                          <img src={p.cover_url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-4xl font-black text-gradient">{category?.[0] ?? "✦"}</span>
                        </div>
                      )}
                      <div className="p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          {category && (
                            <span className="inline-block text-xs text-teal-300 tracking-widest">{category}</span>
                          )}
                          {p.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 text-white px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-white" /> مميز
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold mb-2 line-clamp-2 pb-0 text-white">{title}</h2>
                        {excerpt && <p className="text-sm text-white/80 line-clamp-3 mb-4">{excerpt}</p>}
                        <div className="flex items-center gap-4 text-xs text-white/70 flex-wrap">
                          {author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{author}</span>}
                          {/* Date hidden as requested */}
                          {p.reading_time ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.reading_time} د</span> : null}
                        </div>
                        <span className="inline-flex items-center gap-1 mt-4 text-teal-300 text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                          {t.blog.readMore} <Arrow className="w-3 h-3" />
                        </span>
                      </div>
                    </>
                  );
                })()}
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
