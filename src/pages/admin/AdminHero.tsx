import { useEffect, useState } from "react";
import { Loader2, Save, AlertCircle, Image as ImageIcon, Type, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

type HeroContent = {
  eyebrow: string;
  headlines: string[];
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  card_title: string;
  card_subtitle: string;
  bg_image: string;
  card_image: string;
  card_image_visible: boolean;
  card_text_visible: boolean;
};

const defaults: HeroContent = {
  eyebrow: "",
  headlines: ["نضع الإتقان في قلب كل تفصيل"],
  cta_primary_label: "ابدأ مشروعك",
  cta_primary_href: "/contact",
  cta_secondary_label: "أعمالنا",
  cta_secondary_href: "/portfolio",
  card_title: "وكالة إتقان",
  card_subtitle: "للخدمات التسويقية",
  bg_image: "",
  card_image: "",
  card_image_visible: true,
  card_text_visible: true,
};

export default function AdminHero() {
  const [data, setData] = useState<HeroContent>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: row } = await (supabase as any)
        .from("site_pages").select("content").eq("page_key", "hero").maybeSingle();
      if (row?.content) {
        setData({
          ...defaults,
          ...row.content,
          headlines: Array.isArray(row.content.headlines) && row.content.headlines.length
            ? row.content.headlines
            : defaults.headlines,
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true); setErr(null); setOk(null);
    const { error } = await (supabase as any)
      .from("site_pages")
      .upsert([{ page_key: "hero", content: data }], { onConflict: "page_key" });
    setSaving(false);
    if (error) setErr(error.message);
    else { setOk("تم حفظ محتوى الهيرو"); setTimeout(() => setOk(null), 3000); }
  };

  const updateHeadline = (i: number, v: string) => {
    const h = [...data.headlines]; h[i] = v; setData({ ...data, headlines: h });
  };
  const addHeadline = () => setData({ ...data, headlines: [...data.headlines, ""] });
  const removeHeadline = (i: number) =>
    setData({ ...data, headlines: data.headlines.filter((_, x) => x !== i) });

  if (loading)
    return <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" /> واجهة الهيرو (Hero)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            تحكم في النصوص وصورة الخلفية الظاهرة داخل التاب في الصفحة الرئيسية
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

      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
          <ImageIcon className="w-4 h-4 text-emerald-400" /> صورة الخلفية داخل التاب
        </div>
        <CoverUploader
          value={data.bg_image}
          onChange={(url) => setData({ ...data, bg_image: url || "" })}
          folder="hero"
          label="ارفع صورة الخلفية (يفضل 1600×1000)"
        />
        <Field label="أو ألصق رابط صورة مباشرة">
          <input className={inputCls} placeholder="https://..." value={data.bg_image}
            onChange={(e) => setData({ ...data, bg_image: e.target.value })} />
        </Field>
      </div>

      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
          <Type className="w-4 h-4 text-emerald-400" /> العناوين الرئيسية
        </div>
        <p className="text-[11px] text-slate-500">
          العنوان الأول هو الذي يظهر ثابتاً فوق التاب في الصفحة الرئيسية.
        </p>
        {data.headlines.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center">{i + 1}</span>
            <input className={inputCls} value={h} onChange={(e) => updateHeadline(i, e.target.value)} />
            {data.headlines.length > 1 && (
              <button onClick={() => removeHeadline(i)}
                className="p-2 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addHeadline}
          className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> عنوان جديد
        </button>
      </div>

      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold pb-2 border-b border-slate-800">
          البطاقة داخل التاب
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="عنوان البطاقة">
            <input className={inputCls} value={data.card_title}
              onChange={(e) => setData({ ...data, card_title: e.target.value })} />
          </Field>
          <Field label="العنوان الفرعي">
            <input className={inputCls} value={data.card_subtitle}
              onChange={(e) => setData({ ...data, card_subtitle: e.target.value })} />
          </Field>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-slate-300 font-bold">صورة الكارت (الشعار ثلاثي الأبعاد)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                ستحل هذه الصورة محل الشعار داخل الكارت المتحرك — مع الحفاظ على كل تأثيرات الحركة مع الماوس والعمق ثلاثي الأبعاد.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setData({ ...data, card_image_visible: !data.card_image_visible })}
              className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition ${
                data.card_image_visible
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400"
              }`}
              aria-pressed={data.card_image_visible}
            >
              <span className={`w-9 h-5 rounded-full relative transition ${data.card_image_visible ? "bg-emerald-500" : "bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${data.card_image_visible ? "left-4" : "left-0.5"}`} />
              </span>
              {data.card_image_visible ? "ظاهرة داخل التاب" : "مخفية من التاب"}
            </button>
          </div>

          <CoverUploader
            value={data.card_image}
            onChange={(url) => setData({ ...data, card_image: url || "" })}
            folder="hero"
            label="ارفع صورة الكارت (يفضل مربعة بخلفية شفافة PNG)"
          />
          <Field label="أو ألصق رابط صورة مباشرة">
            <input className={inputCls} placeholder="https://..." value={data.card_image}
              onChange={(e) => setData({ ...data, card_image: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="cyber-panel rounded-xl p-6 space-y-4">
        <div className="text-sm text-white font-bold pb-2 border-b border-slate-800">
          أزرار الدعوة (CTA)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="زر رئيسي — النص">
            <input className={inputCls} value={data.cta_primary_label}
              onChange={(e) => setData({ ...data, cta_primary_label: e.target.value })} />
          </Field>
          <Field label="زر رئيسي — الرابط">
            <input className={inputCls} value={data.cta_primary_href}
              onChange={(e) => setData({ ...data, cta_primary_href: e.target.value })} />
          </Field>
          <Field label="زر ثانوي — النص">
            <input className={inputCls} value={data.cta_secondary_label}
              onChange={(e) => setData({ ...data, cta_secondary_label: e.target.value })} />
          </Field>
          <Field label="زر ثانوي — الرابط">
            <input className={inputCls} value={data.cta_secondary_href}
              onChange={(e) => setData({ ...data, cta_secondary_href: e.target.value })} />
          </Field>
        </div>
      </div>
    </div>
  );
}
