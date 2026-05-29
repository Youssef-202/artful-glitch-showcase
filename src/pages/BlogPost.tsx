import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
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
    <article className="px-6 max-w-3xl mx-auto" dir={isEn ? "ltr" : "rtl"}>
      <Link to="/blog" className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-6">
        <Arrow className="w-4 h-4" /> {t.blog.backToBlog}
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {category && <p className="text-sm text-primary tracking-widest mb-3">{category}</p>}
        <h1 className="text-4xl sm:text-5xl font-black mb-4"><span className="text-gradient">{title}</span></h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
          {author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{author}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.created_at).toLocaleDateString()}</span>
          {post.reading_time ? <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.reading_time} {isEn ? "min read" : "دقيقة قراءة"}</span> : null}
        </div>
        {post.cover_url && (
          <img src={post.cover_url} alt={title} className="w-full rounded-3xl mb-8" />
        )}
        <div
          className="prose-rich max-w-none text-lg leading-relaxed text-foreground/90"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        {gallery.length > 0 && (
          <div className="mt-10">
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
    </article>
  );
}

