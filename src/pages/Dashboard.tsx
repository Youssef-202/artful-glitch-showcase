import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, LayoutDashboard, LogOut, Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/FileUpload";
import { MultiFileUpload } from "@/components/MultiFileUpload";

type Post = {
  id: string; title: string; excerpt: string | null; content: string;
  cover_url: string | null; author_name: string | null; category: string | null;
  published: boolean; created_at: string;
};

const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(1).max(20000),
  cover_url: z.string().trim().url().optional().or(z.literal("")),
  author_name: z.string().trim().max(100).optional().or(z.literal("")),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  published: z.boolean(),
});

function Sidebar() {
  const { t } = useLang();
  const { signOut } = useAuth();
  const nav = useNavigate();
  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: t.dashboard.title, end: true },
    { to: "/dashboard/posts", icon: FileText, label: t.dashboard.posts },
    { to: "/dashboard/portfolio", icon: ImageIcon, label: t.dashboard.portfolio },
  ];
  return (
    <aside className="w-64 shrink-0 glass-strong rounded-3xl p-4 flex flex-col gap-2 h-fit sticky top-24">
      <div className="px-3 py-4 mb-2 border-b border-border/50">
        <p className="text-xs text-primary tracking-widest">إتقان</p>
        <p className="font-black text-lg">{t.dashboard.title}</p>
      </div>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition",
              isActive ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow" : "hover:bg-foreground/5"
            )
          }
        >
          <it.icon className="w-4 h-4" />
          {it.label}
        </NavLink>
      ))}
      <button
        onClick={async () => { await signOut(); nav("/"); }}
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-destructive/10 text-destructive"
      >
        <LogOut className="w-4 h-4" /> {t.auth.logout}
      </button>
    </aside>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 flex items-center justify-between hover:shadow-glow transition"
    >
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-black text-gradient">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </motion.div>
  );
}

function Overview({ posts }: { posts: Post[] }) {
  const { t } = useLang();
  const published = posts.filter((p) => p.published).length;
  return (
    <div>
      <h1 className="text-3xl font-black mb-6"><span className="text-gradient">{t.dashboard.title}</span></h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label={t.dashboard.total} value={posts.length} icon={FileText} />
        <Stat label={t.dashboard.publishedCount} value={published} icon={Eye} />
        <Stat label={t.dashboard.drafts} value={posts.length - published} icon={EyeOff} />
      </div>
      <div className="glass-strong rounded-3xl p-6">
        <h2 className="font-bold mb-4">{t.dashboard.posts}</h2>
        <div className="space-y-2">
          {posts.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5">
              <div className="min-w-0">
                <p className="font-bold truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              {p.published ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostsList({ posts, onChange }: { posts: Post[]; onChange: () => void }) {
  const { t } = useLang();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("✓"); onChange(); }
  };

  if (creating || editing) {
    return <PostForm post={editing} onClose={() => { setEditing(null); setCreating(false); onChange(); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black"><span className="text-gradient">{t.dashboard.posts}</span></h1>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
          <Plus className="w-4 h-4" /> {t.dashboard.newPost}
        </button>
      </div>
      <div className="glass-strong rounded-3xl overflow-hidden">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-foreground/5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold truncate">{p.title}</p>
                {p.published ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">{p.category} · {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center text-muted-foreground py-12">{t.blog.empty}</p>}
      </div>
    </div>
  );
}

function PostForm({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    cover_url: post?.cover_url ?? "",
    author_name: post?.author_name ?? "",
    category: post?.category ?? "",
    published: post?.published ?? true,
  });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = postSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const payload = {
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published,
      excerpt: parsed.data.excerpt || null,
      cover_url: parsed.data.cover_url || null,
      author_name: parsed.data.author_name || null,
      category: parsed.data.category || null,
    };
    const res = post
      ? await supabase.from("blog_posts").update(payload).eq("id", post.id)
      : await supabase.from("blog_posts").insert({ ...payload, created_by: user?.id });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("✓"); onClose(); }
  };

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black"><span className="text-gradient">{post ? t.dashboard.editPost : t.dashboard.newPost}</span></h1>
        <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t.dashboard.cancel}
        </button>
      </div>
      <input required maxLength={200} placeholder={t.dashboard.postTitle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-lg font-bold" />
      <div className="grid sm:grid-cols-2 gap-4">
        <input maxLength={100} placeholder={t.dashboard.author} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        <input maxLength={50} placeholder={t.dashboard.category} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
      </div>
      <FileUpload value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url ?? "" })} folder="blog" accept="image/*" label="صورة الغلاف" />
      <input type="url" placeholder={t.dashboard.cover + " (أو رابط مباشر)"} value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs" />
      <textarea maxLength={500} rows={2} placeholder={t.dashboard.excerpt} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none" />
      <textarea required maxLength={20000} rows={10} placeholder={t.dashboard.content} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none font-mono text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        {t.dashboard.published}
      </label>
      <button type="submit" disabled={busy}
        className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        {t.dashboard.save}
      </button>
    </form>
  );
}

type PItem = {
  id: string;
  category: string;
  title_ar: string;
  title_en: string;
  client_ar: string | null;
  client_en: string | null;
  cover_url: string | null;
  color: string;
  accent: string;
  sort_order: number;
  published: boolean;
};

const itemSchema = z.object({
  category: z.enum(["branding", "web", "design", "photo"]),
  title_ar: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  client_ar: z.string().trim().max(200).optional().or(z.literal("")),
  client_en: z.string().trim().max(200).optional().or(z.literal("")),
  cover_url: z.string().trim().url().optional().or(z.literal("")),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  sort_order: z.number().int(),
  published: z.boolean(),
});

function PortfolioManager({ items, onChange }: { items: PItem[]; onChange: () => void }) {
  const { t } = useLang();
  const [editing, setEditing] = useState<PItem | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("✓"); onChange(); }
  };

  if (creating || editing) {
    return <PortfolioForm item={editing} onClose={() => { setEditing(null); setCreating(false); onChange(); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black"><span className="text-gradient">{t.dashboard.portfolio}</span></h1>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
          <Plus className="w-4 h-4" /> {t.dashboard.newItem}
        </button>
      </div>
      <div className="glass-strong rounded-3xl overflow-hidden">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-foreground/5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.accent})` }}>
                {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold truncate">{p.title_ar} / {p.title_en}</p>
                  {p.published ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">{p.category} · #{p.sort_order}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">—</p>}
      </div>
    </div>
  );
}

function PortfolioForm({ item, onClose }: { item: PItem | null; onClose: () => void }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: item?.category ?? "branding",
    title_ar: item?.title_ar ?? "",
    title_en: item?.title_en ?? "",
    client_ar: item?.client_ar ?? "",
    client_en: item?.client_en ?? "",
    cover_url: item?.cover_url ?? "",
    color: item?.color ?? "#115e59",
    accent: item?.accent ?? "#5fd9cf",
    sort_order: item?.sort_order ?? 0,
    published: item?.published ?? true,
  });
  const [gallery, setGallery] = useState<string[]>(((item as any)?.gallery_urls as string[]) ?? []);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = itemSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const payload = {
      category: parsed.data.category,
      title_ar: parsed.data.title_ar,
      title_en: parsed.data.title_en,
      client_ar: parsed.data.client_ar || null,
      client_en: parsed.data.client_en || null,
      cover_url: parsed.data.cover_url || null,
      color: parsed.data.color,
      accent: parsed.data.accent,
      sort_order: parsed.data.sort_order,
      published: parsed.data.published,
      gallery_urls: gallery,
    };
    const res = item
      ? await supabase.from("portfolio_items").update(payload).eq("id", item.id)
      : await supabase.from("portfolio_items").insert({ ...payload, created_by: user?.id });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("✓"); onClose(); }
  };

  const cats = ["branding", "web", "design", "photo"];

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black"><span className="text-gradient">{item ? t.dashboard.editItem : t.dashboard.newItem}</span></h1>
        <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t.dashboard.cancel}
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required maxLength={200} placeholder={t.dashboard.itemTitleAr} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        <input required maxLength={200} placeholder={t.dashboard.itemTitleEn} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        <input maxLength={200} placeholder={t.dashboard.itemClientAr} value={form.client_ar} onChange={(e) => setForm({ ...form, client_ar: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        <input maxLength={200} placeholder={t.dashboard.itemClientEn} value={form.client_en} onChange={(e) => setForm({ ...form, client_en: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
      </div>
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary">
        {cats.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <FileUpload value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url ?? "" })} folder="portfolio" accept="image/*,video/*" label="صورة/فيديو العمل" />
      <input type="url" placeholder={t.dashboard.cover + " (أو رابط مباشر)"} value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs" />
      <div className="space-y-2">
        <p className="text-sm font-bold">معرض صور المشروع (يمكنك رفع أكثر من 10 صور)</p>
        <MultiFileUpload
          value={gallery}
          onChange={setGallery}
          folder="portfolio/gallery"
          accept="image/*,video/*"
          label="ارفع صور المعرض"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="flex items-center gap-2 bg-background/50 border border-border rounded-xl px-3 py-2">
          <span className="text-sm text-muted-foreground flex-1">{t.dashboard.itemColor}</span>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-8 rounded" />
        </label>
        <label className="flex items-center gap-2 bg-background/50 border border-border rounded-xl px-3 py-2">
          <span className="text-sm text-muted-foreground flex-1">{t.dashboard.itemAccent}</span>
          <input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="w-10 h-8 rounded" />
        </label>
        <input type="number" placeholder={t.dashboard.itemSort} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        {t.dashboard.published}
      </label>
      <button type="submit" disabled={busy}
        className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        {t.dashboard.save}
      </button>
    </form>
  );
}

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLang();
  const [posts, setPosts] = useState<Post[]>([]);
  const [portfolio, setPortfolio] = useState<PItem[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data as any) ?? []));
    supabase.from("portfolio_items").select("*").order("sort_order", { ascending: true })
      .then(({ data }) => setPortfolio((data as any) ?? []));
  }, [isAdmin, tick]);

  if (loading) return <div className="px-6 h-96 animate-pulse" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="px-6 max-w-2xl mx-auto text-center py-20">
        <div className="glass-strong rounded-3xl p-10">
          <p className="text-lg mb-2">⚠️ {t.dashboard.noAccess}</p>
          <p className="text-sm text-muted-foreground">User ID: <code className="text-xs">{user.id}</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Routes>
          <Route index element={<Overview posts={posts} />} />
          <Route path="posts" element={<PostsList posts={posts} onChange={() => setTick((t) => t + 1)} />} />
          <Route path="portfolio" element={<PortfolioManager items={portfolio} onChange={() => setTick((t) => t + 1)} />} />
        </Routes>
      </div>
    </div>
  );
}
