import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";

type HeroContent = {
  media_type: "image" | "video" | "logo";
  media_url: string;
};

const empty: HeroContent = { media_type: "logo", media_url: "" };

export default function HeroManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<HeroContent>(empty);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setContent({ ...empty, ...(data.content as HeroContent) });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await (supabase.from as any)("site_pages").upsert({
      page_key: "hero",
      content,
      updated_by: user?.id,
    }, { onConflict: "page_key" });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("تم الحفظ ✓");
  };

  if (loading) return <div className="h-96 animate-pulse" />;

  const isVideo = content.media_type === "video";
  const accept = isVideo ? "video/*" : "image/*";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black"><span className="text-gradient">الصفحة الرئيسية — بطاقة البرومت</span></h1>
        <button onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> حفظ التغييرات
        </button>
      </div>

      <section className="glass-strong rounded-3xl p-6 space-y-4">
        <div>
          <p className="text-sm font-bold mb-2">نوع المحتوى داخل البطاقة</p>
          <div className="inline-flex rounded-full bg-background/50 border border-border p-1">
            {(["logo", "image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContent((c) => ({ ...c, media_type: t, media_url: t === "logo" ? "" : c.media_url }))}
                className={`px-5 py-2 rounded-full text-sm font-bold transition ${
                  content.media_type === t
                    ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow"
                    : "text-muted-foreground"
                }`}
              >
                {t === "logo" ? "اللوجو ثلاثي الأبعاد" : t === "image" ? "صورة" : "فيديو"}
              </button>
            ))}
          </div>
        </div>

        {content.media_type !== "logo" && (
          <>
            <FileUpload
              value={content.media_url}
              onChange={(url) => setContent((c) => ({ ...c, media_url: url ?? "" }))}
              folder="hero"
              accept={accept}
              label={isVideo ? "ارفع فيديو" : "ارفع صورة"}
            />
            <input
              type="url"
              placeholder="أو ضع رابط مباشر"
              value={content.media_url}
              onChange={(e) => setContent((c) => ({ ...c, media_url: e.target.value }))}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs"
            />
          </>
        )}
      </section>
    </div>
  );
}
