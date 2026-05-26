import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";

type BlogContent = {
  kicker: string;
  title: string;
  subtitle: string;
  cover_url: string;
};

const empty: BlogContent = { kicker: "", title: "", subtitle: "", cover_url: "" };

export default function BlogPageManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<BlogContent>(empty);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "blog").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setContent({ ...empty, ...(data.content as BlogContent) });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await (supabase.from as any)("site_pages").upsert({
      page_key: "blog", content, updated_by: user?.id,
    });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("تم الحفظ ✓");
  };

  const set = <K extends keyof BlogContent>(k: K, v: BlogContent[K]) =>
    setContent((c) => ({ ...c, [k]: v }));

  if (loading) return <div className="h-96 animate-pulse" />;

  const inp = "w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black"><span className="text-gradient">صفحة المدونة</span></h1>
        <button onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> حفظ
        </button>
      </div>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <h2 className="font-bold mb-2">رأس الصفحة</h2>
        <input className={inp} placeholder="نص علوي صغير" value={content.kicker} onChange={(e) => set("kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان الرئيسي" value={content.title} onChange={(e) => set("title", e.target.value)} />
        <textarea rows={3} className={inp + " resize-none"} placeholder="الوصف" value={content.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        <FileUpload value={content.cover_url} onChange={(u) => set("cover_url", u ?? "")} folder="blog/page" accept="image/*" label="صورة الغلاف (اختياري)" />
      </section>

      <button onClick={save} disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        <Save className="w-4 h-4" /> حفظ التغييرات
      </button>
    </div>
  );
}
