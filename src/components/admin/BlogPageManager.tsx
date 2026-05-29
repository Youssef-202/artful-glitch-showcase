import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, Star, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";
import { MultiFileUpload } from "@/components/MultiFileUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";

type BlogContent = {
  kicker: string;
  title: string;
  subtitle: string;
  cover_url: string;
};

type Post = {
  id: string;
  title: string; title_en: string | null;
  excerpt: string | null; excerpt_en: string | null;
  content: string; content_en: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  author_name: string | null; author_name_en: string | null;
  category: string | null; category_en: string | null;
  reading_time: number | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
};

const emptyContent: BlogContent = { kicker: "", title: "", subtitle: "", cover_url: "" };

const inp = "w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary";

export default function BlogPageManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<BlogContent>(emptyContent);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const loadPosts = () => {
    supabase.from("blog_posts").select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data as any) ?? []));
  };

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "blog").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setContent({ ...emptyContent, ...(data.content as BlogContent) });
        setLoading(false);
      });
    loadPosts();
  }, []);

  const saveHeader = async () => {
    setBusy(true);
    const { error } = await (supabase.from as any)("site_pages").upsert({
      page_key: "blog", content, updated_by: user?.id,
    });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("تم حفظ رأس الصفحة ✓");
  };

  const set = <K extends keyof BlogContent>(k: K, v: BlogContent[K]) =>
    setContent((c) => ({ ...c, [k]: v }));

  const removePost = async (id: string) => {
    if (!confirm("حذف المقال؟")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("تم الحذف ✓"); loadPosts(); }
  };

  const togglePublish = async (p: Post) => {
    const { error } = await supabase.from("blog_posts").update({ published: !p.published }).eq("id", p.id);
    if (error) toast.error(error.message); else loadPosts();
  };

  const toggleFeatured = async (p: Post) => {
    const { error } = await (supabase.from("blog_posts") as any).update({ featured: !p.featured }).eq("id", p.id);
    if (error) toast.error(error.message); else loadPosts();
  };

  const reorder = async (p: Post, delta: number) => {
    const { error } = await (supabase.from("blog_posts") as any).update({ sort_order: (p.sort_order ?? 0) + delta }).eq("id", p.id);
    if (error) toast.error(error.message); else loadPosts();
  };

  if (loading) return <div className="h-96 animate-pulse" />;

  if (creating || editing) {
    return <PostForm post={editing} onClose={() => { setEditing(null); setCreating(false); loadPosts(); }} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black"><span className="text-gradient">صفحة المدونة</span></h1>
        <button onClick={saveHeader} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> حفظ رأس الصفحة
        </button>
      </div>

      {/* رأس الصفحة */}
      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <h2 className="font-bold mb-2">رأس الصفحة</h2>
        <input className={inp} placeholder="نص علوي صغير" value={content.kicker} onChange={(e) => set("kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان الرئيسي" value={content.title} onChange={(e) => set("title", e.target.value)} />
        <textarea rows={3} className={inp + " resize-none"} placeholder="الوصف" value={content.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        <FileUpload value={content.cover_url} onChange={(u) => set("cover_url", u ?? "")} folder="blog/page" accept="image/*" label="صورة الغلاف (اختياري)" />
      </section>

      {/* قائمة المقالات */}
      <section className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl">المقالات</h2>
            <p className="text-sm text-muted-foreground">أضف عدد غير محدود من المقالات مع تحكم دقيق</p>
          </div>
          <button onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
            <Plus className="w-4 h-4" /> مقال جديد
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border/40">
          {posts.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد مقالات بعد</p>}
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 border-b border-border/40 last:border-0 hover:bg-foreground/5">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-accent/20">
                {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold truncate">{p.title}</p>
                  {p.featured && <Star className="w-3 h-3 text-primary fill-primary" />}
                  {p.published ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {p.category && <span>{p.category} · </span>}
                  {new Date(p.created_at).toLocaleDateString()}
                  {p.gallery_urls && p.gallery_urls.length > 0 && <span> · {p.gallery_urls.length} صورة</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => reorder(p, -1)} title="لأعلى" className="p-2 rounded-lg hover:bg-foreground/10"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => reorder(p, 1)} title="لأسفل" className="p-2 rounded-lg hover:bg-foreground/10"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => toggleFeatured(p)} title="مميز"
                  className={cn("p-2 rounded-lg hover:bg-primary/10", p.featured ? "text-primary" : "text-muted-foreground")}>
                  <Star className={cn("w-4 h-4", p.featured && "fill-primary")} />
                </button>
                <button onClick={() => togglePublish(p)} title={p.published ? "إخفاء" : "نشر"}
                  className={cn("p-2 rounded-lg hover:bg-primary/10", p.published ? "text-primary" : "text-muted-foreground")}>
                  {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removePost(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PostForm({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { user } = useAuth();
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [form, setForm] = useState({
    title: post?.title ?? "",
    title_en: post?.title_en ?? "",
    excerpt: post?.excerpt ?? "",
    excerpt_en: post?.excerpt_en ?? "",
    content: post?.content ?? "",
    content_en: post?.content_en ?? "",
    cover_url: post?.cover_url ?? "",
    gallery_urls: post?.gallery_urls ?? [],
    author_name: post?.author_name ?? "",
    author_name_en: post?.author_name_en ?? "",
    category: post?.category ?? "",
    category_en: post?.category_en ?? "",
    reading_time: post?.reading_time ?? 0,
    featured: post?.featured ?? false,
    published: post?.published ?? true,
    sort_order: post?.sort_order ?? 0,
  });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("العنوان مطلوب"); return; }
    if (!form.content.trim()) { toast.error("محتوى المقال مطلوب"); return; }
    setBusy(true);
    const payload: any = {
      title: form.title.trim(),
      title_en: form.title_en.trim() || null,
      content: form.content,
      content_en: form.content_en || null,
      excerpt: form.excerpt.trim() || null,
      excerpt_en: form.excerpt_en.trim() || null,
      cover_url: form.cover_url || null,
      gallery_urls: form.gallery_urls,
      author_name: form.author_name.trim() || null,
      author_name_en: form.author_name_en.trim() || null,
      category: form.category.trim() || null,
      category_en: form.category_en.trim() || null,
      reading_time: form.reading_time || null,
      featured: form.featured,
      published: form.published,
      sort_order: form.sort_order,
    };
    const res = post
      ? await (supabase.from("blog_posts") as any).update(payload).eq("id", post.id)
      : await (supabase.from("blog_posts") as any).insert({ ...payload, created_by: user?.id });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("تم الحفظ ✓"); onClose(); }
  };

  const isAr = lang === "ar";

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black"><span className="text-gradient">{post ? "تعديل المقال" : "مقال جديد"}</span></h1>
        <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> رجوع
        </button>
      </div>

      <div className="inline-flex rounded-full bg-background/50 border border-border p-1">
        <button type="button" onClick={() => setLang("ar")}
          className={cn("px-5 py-2 rounded-full text-sm font-bold transition", isAr ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow" : "text-muted-foreground")}>
          🇸🇦 العربية
        </button>
        <button type="button" onClick={() => setLang("en")}
          className={cn("px-5 py-2 rounded-full text-sm font-bold transition", !isAr ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow" : "text-muted-foreground")}>
          🇬🇧 English
        </button>
      </div>

      {isAr ? (
        <div className="space-y-4" dir="rtl">
          <input required maxLength={200} placeholder="عنوان المقال (عربي)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp + " text-lg font-bold"} />
          <div className="grid sm:grid-cols-2 gap-4">
            <input maxLength={100} placeholder="اسم الكاتب" value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })} className={inp} />
            <input maxLength={50} placeholder="التصنيف" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp} />
          </div>
          <textarea maxLength={500} rows={2} placeholder="مقتطف قصير يظهر في القائمة" value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inp + " resize-none"} />
          <div>
            <p className="text-sm font-bold mb-2">محتوى المقال (عربي)</p>
            <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="اكتب المقال هنا…" dir="rtl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4" dir="ltr">
          <input maxLength={200} placeholder="Article title (English)" value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })} className={inp + " text-lg font-bold"} />
          <div className="grid sm:grid-cols-2 gap-4">
            <input maxLength={100} placeholder="Author name" value={form.author_name_en}
              onChange={(e) => setForm({ ...form, author_name_en: e.target.value })} className={inp} />
            <input maxLength={50} placeholder="Category" value={form.category_en}
              onChange={(e) => setForm({ ...form, category_en: e.target.value })} className={inp} />
          </div>
          <textarea maxLength={500} rows={2} placeholder="Excerpt" value={form.excerpt_en}
            onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} className={inp + " resize-none"} />
          <div>
            <p className="text-sm font-bold mb-2">Article content (English)</p>
            <RichTextEditor value={form.content_en} onChange={(html) => setForm({ ...form, content_en: html })} placeholder="Write the article here…" dir="ltr" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-bold">صورة الغلاف</p>
        <FileUpload value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url ?? "" })}
          folder="blog/covers" accept="image/*" label="صورة الغلاف الرئيسية" />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold">معرض الصور (داخل المقال)</p>
        <MultiFileUpload value={form.gallery_urls} onChange={(urls) => setForm({ ...form, gallery_urls: urls })}
          folder="blog/gallery" accept="image/*" label="أضف صور إضافية للمقال" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">وقت القراءة (دقيقة)</span>
          <input type="number" min={0} className={inp} value={form.reading_time}
            onChange={(e) => setForm({ ...form, reading_time: Number(e.target.value) })} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted-foreground">الترتيب (الأقل أولاً)</span>
          <input type="number" className={inp} value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
        </label>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            مميز
          </label>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            منشور
          </label>
        </div>
      </div>

      <button type="submit" disabled={busy}
        className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        {busy ? "جاري الحفظ…" : "حفظ المقال"}
      </button>
    </form>
  );
}
