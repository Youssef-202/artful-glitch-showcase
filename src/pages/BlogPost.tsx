import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronDown, User } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import "@/components/rich-text-editor.css";

type Post = {
  id: string; title: string; excerpt: string | null; content: string;
  title_en: string | null; excerpt_en: string | null; content_en: string | null;
  author_name_en: string | null; category_en: string | null;
  cover_url: string | null; author_name: string | null; category: string | null;
  gallery_urls: string[] | null; reading_time: number | null;
  created_at: string;
};

export default function BlogPost() {
  const { id } = useParams();
  const { t, dir, lang } = useLang() as any;
  const Arrow = dir === "rtl" ? ArrowRight : ArrowLeft;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("blog_posts").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setPost(data as any);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="px-6 max-w-3xl mx-auto h-96 animate-pulse glass rounded-3xl" />;
  if (!post) return <div className="px-6 max-w-3xl mx-auto text-center py-20">{t.blog.empty}</div>;

  const isEn = lang === "en";
  const title = (isEn && post.title_en) ? post.title_en : post.title;
  const content = (isEn && post.content_en) ? post.content_en : post.content;
  const category = (isEn && post.category_en) ? post.category_en : post.category;
  const author = (isEn && post.author_name_en) ? post.author_name_en : post.author_name;
  const gallery = post.gallery_urls ?? [];

  return (
    <article dir={isEn ? "ltr" : "rtl"}>
      {/* Full-screen hero */}
      <section className="relative w-screen h-screen overflow-hidden left-1/2 right-1/2 -translate-x-1/2 ml-[-50vw] mr-[-50vw]">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-8">
            <Arrow className="w-4 h-4" /> {t.blog.backToBlog}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            {category && <p className="text-sm text-primary tracking-widest mb-4">{category}</p>}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-gradient">{title}</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              {author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{author}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.created_at).toLocaleDateString()}</span>
              {post.reading_time ? <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.reading_time} {isEn ? "min read" : "دقيقة قراءة"}</span> : null}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-muted-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>


      {/* Article content (revealed on scroll) */}
      <div className="px-6 max-w-3xl mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="prose-rich max-w-none text-lg leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {gallery.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">{isEn ? "Gallery" : "معرض الصور"}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {gallery.map((url, i) => (
                  <img key={url + i} src={url} alt="" loading="lazy"
                    className="w-full rounded-2xl object-cover aspect-video hover:scale-[1.02] transition-transform" />
                ))}
              </div>
            </div>
          )}
        </motion.div>
        <div className="h-16" />
      </div>
    </article>
  );
}
