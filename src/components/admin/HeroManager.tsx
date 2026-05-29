import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";

type TextBlock = {
  enabled: boolean;
  value: string;
  color: string;        // hex / hsl
  size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  weight: "light" | "normal" | "medium" | "semibold" | "bold";
  align: "right" | "center" | "left";
};

type HeroContent = {
  media_type: "image" | "video" | "logo";
  media_url: string;
  media_fit: "cover" | "contain";
  media_opacity: number; // 0..100
  text_position: "top" | "center" | "bottom";
  overlay: "none" | "dark" | "light";
  overlay_opacity: number; // 0..100
  text1: TextBlock;
  text2: TextBlock;
};

const defaultText1: TextBlock = {
  enabled: true,
  value: "الإتقان ليس مجرد كلمة، بل هو فلسفتنا في كل بكسل، وكل سطر كود، وكل قصة نرويها.",
  color: "#ffffff",
  size: "lg",
  weight: "light",
  align: "center",
};

const defaultText2: TextBlock = {
  enabled: true,
  value: "نؤمن أن الفرق بين الجيد والاستثنائي يكمن في التفاصيل التي لا يراها أحد — لكنها تُحسّ.",
  color: "#ffffffcc",
  size: "md",
  weight: "light",
  align: "center",
};

const empty: HeroContent = {
  media_type: "logo",
  media_url: "",
  media_fit: "cover",
  media_opacity: 100,
  text_position: "top",
  overlay: "dark",
  overlay_opacity: 50,
  text1: defaultText1,
  text2: defaultText2,
};

// Migrate legacy shape (text1/text2 as strings)
function normalize(raw: any): HeroContent {
  if (!raw) return empty;
  const t1 = typeof raw.text1 === "string"
    ? { ...defaultText1, value: raw.text1 }
    : { ...defaultText1, ...(raw.text1 ?? {}) };
  const t2 = typeof raw.text2 === "string"
    ? { ...defaultText2, value: raw.text2 }
    : { ...defaultText2, ...(raw.text2 ?? {}) };
  return { ...empty, ...raw, text1: t1, text2: t2 };
}

const sizeOptions = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
const weightOptions = ["light", "normal", "medium", "semibold", "bold"] as const;
const alignOptions = ["right", "center", "left"] as const;

export default function HeroManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<HeroContent>(empty);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "hero").maybeSingle()
      .then(({ data }: any) => {
        setContent(normalize(data?.content));
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

  const updateText = (key: "text1" | "text2", patch: Partial<TextBlock>) =>
    setContent((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

  const TextEditor = ({ label, k }: { label: string; k: "text1" | "text2" }) => {
    const t = content[k];
    return (
      <div className="rounded-2xl border border-border bg-background/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{label}</p>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={t.enabled}
              onChange={(e) => updateText(k, { enabled: e.target.checked })}
            />
            مفعّل
          </label>
        </div>

        <textarea
          value={t.value}
          onChange={(e) => updateText(k, { value: e.target.value })}
          rows={2}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <label className="space-y-1">
            <span className="block text-muted-foreground">اللون</span>
            <input
              type="color"
              value={t.color.length === 7 ? t.color : "#ffffff"}
              onChange={(e) => updateText(k, { color: e.target.value })}
              className="w-full h-9 bg-transparent rounded-lg cursor-pointer"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-muted-foreground">الحجم</span>
            <select
              value={t.size}
              onChange={(e) => updateText(k, { size: e.target.value as TextBlock["size"] })}
              className="w-full bg-background/50 border border-border rounded-lg px-2 h-9"
            >
              {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-muted-foreground">السماكة</span>
            <select
              value={t.weight}
              onChange={(e) => updateText(k, { weight: e.target.value as TextBlock["weight"] })}
              className="w-full bg-background/50 border border-border rounded-lg px-2 h-9"
            >
              {weightOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-muted-foreground">المحاذاة</span>
            <select
              value={t.align}
              onChange={(e) => updateText(k, { align: e.target.value as TextBlock["align"] })}
              className="w-full bg-background/50 border border-border rounded-lg px-2 h-9"
            >
              {alignOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black"><span className="text-gradient">الصفحة الرئيسية — بطاقة البرومت</span></h1>
        <button onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> حفظ التغييرات
        </button>
      </div>

      <section className="glass-strong rounded-3xl p-6 space-y-5">
        <h2 className="text-lg font-bold">النصوص داخل البطاقة</h2>
        <TextEditor label="النص الأول" k="text1" />
        <TextEditor label="النص الثاني" k="text2" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <label className="space-y-1">
            <span className="block text-muted-foreground font-bold">موضع النصوص</span>
            <select
              value={content.text_position}
              onChange={(e) => setContent((c) => ({ ...c, text_position: e.target.value as HeroContent["text_position"] }))}
              className="w-full bg-background/50 border border-border rounded-lg px-2 h-10"
            >
              <option value="top">أعلى</option>
              <option value="center">وسط</option>
              <option value="bottom">أسفل</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-muted-foreground font-bold">طبقة التظليل</span>
            <select
              value={content.overlay}
              onChange={(e) => setContent((c) => ({ ...c, overlay: e.target.value as HeroContent["overlay"] }))}
              className="w-full bg-background/50 border border-border rounded-lg px-2 h-10"
            >
              <option value="none">بدون</option>
              <option value="dark">داكنة</option>
              <option value="light">فاتحة</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-muted-foreground font-bold">شفافية التظليل ({content.overlay_opacity}%)</span>
            <input
              type="range" min={0} max={100}
              value={content.overlay_opacity}
              onChange={(e) => setContent((c) => ({ ...c, overlay_opacity: Number(e.target.value) }))}
              className="w-full"
            />
          </label>
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-5">
        <h2 className="text-lg font-bold">المحتوى المرئي داخل البطاقة</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-muted-foreground font-bold">طريقة العرض</span>
                <select
                  value={content.media_fit}
                  onChange={(e) => setContent((c) => ({ ...c, media_fit: e.target.value as HeroContent["media_fit"] }))}
                  className="w-full bg-background/50 border border-border rounded-lg px-2 h-10"
                >
                  <option value="cover">ملء البطاقة (cover)</option>
                  <option value="contain">احتواء كامل (contain)</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="block text-muted-foreground font-bold">شفافية الوسائط ({content.media_opacity}%)</span>
                <input
                  type="range" min={0} max={100}
                  value={content.media_opacity}
                  onChange={(e) => setContent((c) => ({ ...c, media_opacity: Number(e.target.value) }))}
                  className="w-full"
                />
              </label>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
