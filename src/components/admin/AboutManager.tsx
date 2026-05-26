import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";

type Reason = { title: string; body: string };
type AboutContent = {
  header_kicker: string;
  header_title: string;
  who_kicker: string;
  who_title: string;
  who_body: string;
  who_image: string;
  vision_kicker: string;
  vision_title: string;
  vision_body: string;
  vision_image: string;
  reasons_kicker: string;
  reasons_title: string;
  reasons: Reason[];
};

const empty: AboutContent = {
  header_kicker: "", header_title: "",
  who_kicker: "", who_title: "", who_body: "", who_image: "",
  vision_kicker: "", vision_title: "", vision_body: "", vision_image: "",
  reasons_kicker: "", reasons_title: "", reasons: [],
};

export default function AboutManager() {
  const { user } = useAuth();
  const [content, setContent] = useState<AboutContent>(empty);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from as any)("site_pages").select("content").eq("page_key", "about").maybeSingle()
      .then(({ data }: any) => {
        if (data?.content) setContent({ ...empty, ...(data.content as AboutContent) });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await (supabase.from as any)("site_pages").upsert({
      page_key: "about",
      content,
      updated_by: user?.id,
    });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("تم الحفظ ✓");
  };

  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) =>
    setContent((c) => ({ ...c, [k]: v }));

  const setReason = (i: number, patch: Partial<Reason>) =>
    setContent((c) => ({ ...c, reasons: c.reasons.map((r, idx) => idx === i ? { ...r, ...patch } : r) }));

  const addReason = () => setContent((c) => ({ ...c, reasons: [...c.reasons, { title: "", body: "" }] }));
  const removeReason = (i: number) => setContent((c) => ({ ...c, reasons: c.reasons.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="h-96 animate-pulse" />;

  const inp = "w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black"><span className="text-gradient">صفحة من نحن</span></h1>
        <button onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
          <Save className="w-4 h-4" /> حفظ التغييرات
        </button>
      </div>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <h2 className="font-bold mb-2">العنوان الرئيسي</h2>
        <input className={inp} placeholder="نص علوي صغير" value={content.header_kicker} onChange={(e) => set("header_kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان" value={content.header_title} onChange={(e) => set("header_title", e.target.value)} />
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <h2 className="font-bold mb-2">قسم "من نحن"</h2>
        <input className={inp} placeholder="نص علوي" value={content.who_kicker} onChange={(e) => set("who_kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان" value={content.who_title} onChange={(e) => set("who_title", e.target.value)} />
        <textarea rows={6} className={inp + " resize-none"} placeholder="النص" value={content.who_body} onChange={(e) => set("who_body", e.target.value)} />
        <FileUpload value={content.who_image} onChange={(u) => set("who_image", u ?? "")} folder="about" accept="image/*" label="صورة القسم" />
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <h2 className="font-bold mb-2">قسم "رؤيتنا"</h2>
        <input className={inp} placeholder="نص علوي" value={content.vision_kicker} onChange={(e) => set("vision_kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان" value={content.vision_title} onChange={(e) => set("vision_title", e.target.value)} />
        <textarea rows={6} className={inp + " resize-none"} placeholder="النص" value={content.vision_body} onChange={(e) => set("vision_body", e.target.value)} />
        <FileUpload value={content.vision_image} onChange={(u) => set("vision_image", u ?? "")} folder="about" accept="image/*" label="صورة القسم" />
      </section>

      <section className="glass-strong rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">قسم "لماذا تختارنا؟"</h2>
          <button onClick={addReason} className="inline-flex items-center gap-1 text-sm text-primary font-bold">
            <Plus className="w-4 h-4" /> إضافة سبب
          </button>
        </div>
        <input className={inp} placeholder="نص علوي" value={content.reasons_kicker} onChange={(e) => set("reasons_kicker", e.target.value)} />
        <input className={inp + " text-lg font-bold"} placeholder="العنوان" value={content.reasons_title} onChange={(e) => set("reasons_title", e.target.value)} />
        <div className="space-y-3 pt-2">
          {content.reasons.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border/50 p-4 space-y-2 bg-background/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">سبب #{i + 1}</span>
                <button onClick={() => removeReason(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input className={inp + " font-bold"} placeholder="العنوان" value={r.title} onChange={(e) => setReason(i, { title: e.target.value })} />
              <textarea rows={3} className={inp + " resize-none"} placeholder="الوصف" value={r.body} onChange={(e) => setReason(i, { body: e.target.value })} />
            </div>
          ))}
          {content.reasons.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد عناصر — أضف الأول</p>}
        </div>
      </section>

      <button onClick={save} disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        <Save className="w-4 h-4" /> حفظ التغييرات
      </button>
    </div>
  );
}
