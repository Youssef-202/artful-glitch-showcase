import { useEffect, useState } from "react";
import { Loader2, Save, AlertCircle, Info, Plus, Trash2, Image as ImageIcon, Type, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

type Reason = { title: string; body: string };
type AboutContent = {
  header_kicker: string;
  header_title: string;
  who_kicker: string;
  who_title: string;
  who_body: string;
  who_image: string;
  who_image_fit: "cover" | "contain";
  who_image_height: number;
  vision_kicker: string;
  vision_title: string;
  vision_body: string;
  vision_image: string;
  vision_image_fit: "cover" | "contain";
  vision_image_height: number;
  reasons_kicker: string;
  reasons_title: string;
  reasons: Reason[];
};

const defaults: AboutContent = {
  header_kicker: "تعرّف علينا",
  header_title: "وكالة إتقان",
  who_kicker: "نبذة عنّا",
  who_title: "من نحن",
  who_body: "وكالة إتقان هي وكالة دعاية وإعلان متخصّصة في تقديم خدمات الإعلان والتصميم والتسويق الرقمي بأعلى مستوى من الدقة والاحترافية.",
  who_image: "",
  who_image_fit: "cover",
  who_image_height: 420,
  vision_kicker: "إلى أين نتجه",
  vision_title: "رؤيتنا",
  vision_body: "تسعى وكالة إتقان لأن تكون الشريك الأول للمؤسسات والشركات في رحلة نموّها.",
  vision_image: "",
  vision_image_fit: "cover",
  vision_image_height: 420,
  reasons_kicker: "ما يميّزنا",
  reasons_title: "لماذا تختارنا ؟",
  reasons: [],
};

export default function AdminAbout() {
  const [data, setData] = useState<AboutContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: row } = await (supabase as any)
        .from("site_pages").select("content").eq("page_key", "about").maybeSingle();
      if (row?.content) {
        setData({
          ...defaults,
          ...row.content,
          reasons: Array.isArray(row.content.reasons) ? row.content.reasons : [],
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true); setErr(null); setOk(null);
    const { error } = await (supabase as any)
      .from("site_pages")
      .upsert([{ page_key: "about", content: data }], { onConflict: "page_key" });
    setSaving(false);
    if (error) setErr(error.message);
    else { setOk("تم حفظ محتوى صفحة من نحن"); setTimeout(() => setOk(null), 3000); }
  };

  const set = <K extends keyof AboutContent>(k: K, v: AboutContent[K]) => setData({ ...data, [k]: v });
  const addReason = () => set("reasons", [...data.reasons, { title: "", body: "" }]);
  const updReason = (i: number, patch: Partial<Reason>) =>
    set("reasons", data.reasons.map((r, x) => (x === i ? { ...r, ...patch } : r)));
  const rmReason = (i: number) => set("reasons", data.reasons.filter((_, x) => x !== i));

  if (loading) return <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-400" /> صفحة "من نحن"
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تحكّم كامل في نصوص وصور صفحة "من نحن" الظاهرة على الموقع
          </p>
        </div>
        <button disabled={saving} onClick={save}
          className="px-5 py-2.5 rounded-lg text-sm font-bold text-black
                     bg-gradient-to-b from-[#4dff9b] to-[#26e578]
                     shadow-[0_10px_30px_-8px_rgba(57,255,136,0.55)]
                     flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>

      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}
      {ok && <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">✓ {ok}</div>}

      {/* رأس الصفحة */}
      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
          <Type className="w-4 h-4 text-emerald-400" /> رأس الصفحة
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="النص العلوي (Kicker)">
            <input className={inputCls} value={data.header_kicker} onChange={(e) => set("header_kicker", e.target.value)} />
          </Field>
          <Field label="العنوان الرئيسي">
            <input className={inputCls} value={data.header_title} onChange={(e) => set("header_title", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* من نحن */}
      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
          <Info className="w-4 h-4 text-emerald-400" /> قسم "من نحن"
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="النص العلوي">
            <input className={inputCls} value={data.who_kicker} onChange={(e) => set("who_kicker", e.target.value)} />
          </Field>
          <Field label="عنوان القسم">
            <input className={inputCls} value={data.who_title} onChange={(e) => set("who_title", e.target.value)} />
          </Field>
        </div>
        <Field label="النص (يدعم أسطر متعددة)">
          <textarea rows={5} className={textareaCls} value={data.who_body} onChange={(e) => set("who_body", e.target.value)} />
        </Field>
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-300 font-bold flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" /> صورة القسم
          </div>
          <CoverUploader value={data.who_image} onChange={(url) => set("who_image", url || "")} folder="about" label="ارفع صورة قسم من نحن" />
          <Field label="أو ألصق رابط صورة">
            <input className={inputCls} placeholder="https://..." value={data.who_image} onChange={(e) => set("who_image", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="طريقة العرض">
              <select className={inputCls} value={data.who_image_fit}
                onChange={(e) => set("who_image_fit", e.target.value as "cover" | "contain")}>
                <option value="cover">ملء الإطار (Cover)</option>
                <option value="contain">إظهار الصورة كاملة (Contain)</option>
              </select>
            </Field>
            <Field label="ارتفاع الإطار (px)">
              <input type="number" className={inputCls} value={data.who_image_height}
                onChange={(e) => set("who_image_height", Number(e.target.value) || 420)} />
            </Field>
          </div>
        </div>
      </div>

      {/* رؤيتنا */}
      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-400" /> قسم "رؤيتنا"
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="النص العلوي">
            <input className={inputCls} value={data.vision_kicker} onChange={(e) => set("vision_kicker", e.target.value)} />
          </Field>
          <Field label="عنوان القسم">
            <input className={inputCls} value={data.vision_title} onChange={(e) => set("vision_title", e.target.value)} />
          </Field>
        </div>
        <Field label="النص (يدعم أسطر متعددة)">
          <textarea rows={5} className={textareaCls} value={data.vision_body} onChange={(e) => set("vision_body", e.target.value)} />
        </Field>
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-300 font-bold flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" /> صورة القسم
          </div>
          <CoverUploader value={data.vision_image} onChange={(url) => set("vision_image", url || "")} folder="about" label="ارفع صورة قسم الرؤية" />
          <Field label="أو ألصق رابط صورة">
            <input className={inputCls} placeholder="https://..." value={data.vision_image} onChange={(e) => set("vision_image", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="طريقة العرض">
              <select className={inputCls} value={data.vision_image_fit}
                onChange={(e) => set("vision_image_fit", e.target.value as "cover" | "contain")}>
                <option value="cover">ملء الإطار (Cover)</option>
                <option value="contain">إظهار الصورة كاملة (Contain)</option>
              </select>
            </Field>
            <Field label="ارتفاع الإطار (px)">
              <input type="number" className={inputCls} value={data.vision_image_height}
                onChange={(e) => set("vision_image_height", Number(e.target.value) || 420)} />
            </Field>
          </div>
        </div>
      </div>

      {/* لماذا تختارنا */}
      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="text-sm text-white font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> قسم "لماذا تختارنا"
          </div>
          <button onClick={addReason}
            className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> إضافة سبب
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="النص العلوي">
            <input className={inputCls} value={data.reasons_kicker} onChange={(e) => set("reasons_kicker", e.target.value)} />
          </Field>
          <Field label="عنوان القسم">
            <input className={inputCls} value={data.reasons_title} onChange={(e) => set("reasons_title", e.target.value)} />
          </Field>
        </div>

        {data.reasons.length === 0 && (
          <p className="text-xs text-slate-500 py-4 text-center">لا توجد بنود بعد — اضغط "إضافة سبب" لإنشاء أول بند.</p>
        )}

        <div className="space-y-3">
          {data.reasons.map((r, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-300 font-bold">سبب #{i + 1}</span>
                <button onClick={() => rmReason(i)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Field label="العنوان">
                <input className={inputCls} value={r.title} onChange={(e) => updReason(i, { title: e.target.value })} />
              </Field>
              <Field label="الوصف">
                <textarea rows={3} className={textareaCls} value={r.body} onChange={(e) => updReason(i, { body: e.target.value })} />
              </Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
