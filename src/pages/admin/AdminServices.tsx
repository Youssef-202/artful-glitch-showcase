import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, AlertCircle, Wrench, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, GalleryUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

type Service = any;

const empty: Service = {
  id: "",
  number: "",
  title: "",
  tagline: "",
  description: "",
  long_description: "",
  hero_subtitle: "",
  image_url: "",
  image_alt: "",
  image_caption: "",
  bullets: [],
  features: [],
  process_steps: [],
  deliverables: [],
  reasons: [],
  faqs: [],
  gallery: [],
  price_from: null,
  currency: "EGP",
  duration: "",
  cta_text: "",
  availability_badge: "",
  seo_title: "",
  seo_description: "",
  sort_order: 0,
  published: true,
};

const toLines = (a: any) => (Array.isArray(a) ? a.join("\n") : "");
const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function AdminServices() {
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Service>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("services").select("*").order("sort_order");
    if (error) setErr(error.message);
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const openAdd = () => {
    setForm(empty); setEditingId(null); setGalleryUrls([]); setOpen(true);
  };
  const openEdit = (s: Service) => {
    setForm({ ...empty, ...s });
    setEditingId(s.id);
    const g = s.gallery;
    setGalleryUrls(Array.isArray(g) ? g.map((x: any) => (typeof x === "string" ? x : x?.url)).filter(Boolean) : []);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    const payload = {
      ...form,
      gallery: galleryUrls.map((url) => ({ url })),
      price_from: form.price_from === "" || form.price_from === null ? null : Number(form.price_from),
      sort_order: Number(form.sort_order) || 0,
    };
    const q = editingId
      ? (supabase as any).from("services").update(payload).eq("id", editingId)
      : (supabase as any).from("services").insert([{ ...payload, id: payload.id || crypto.randomUUID() }]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الخدمة نهائياً؟")) return;
    const { error } = await (supabase as any).from("services").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wrench className="w-5 h-5 text-cyan-400" /> الخدمات</h3>
        <button onClick={openAdd} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة خدمة
        </button>
      </div>

      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد خدمات.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">#</th><th className="p-3">العنوان</th><th className="p-3">السعر</th><th className="p-3">المدة</th><th className="p-3">منشور</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/20">
                    <td className="p-3 text-slate-400">{s.number || "—"}</td>
                    <td className="p-3 font-bold text-white">{s.title}</td>
                    <td className="p-3 text-emerald-400 font-mono">{s.price_from ? `${s.price_from} ${s.currency || ""}` : "—"}</td>
                    <td className="p-3 text-slate-400">{s.duration || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${s.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{s.published ? "نعم" : "لا"}</span></td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(s.id)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel w-full max-w-5xl rounded-2xl my-4 mx-auto">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-10 rounded-t-2xl">
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل خدمة" : "إضافة خدمة"}</h4>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="المعرّف (slug)" hint="مثل: branding"><input className={inputCls} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={!!editingId} /></Field>
                <Field label="الرقم التعريفي"><input className={inputCls} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></Field>
                <Field label="ترتيب العرض"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="عنوان الخدمة *"><input required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                <Field label="العنوان الفرعي (Tagline)"><input className={inputCls} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
              </div>

              <Field label="وصف مختصر"><textarea className={textareaCls + " h-20"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              <Field label="عنوان البطل (Hero Subtitle)"><input className={inputCls} value={form.hero_subtitle} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} /></Field>
              <Field label="الوصف المطوّل" hint="يدعم سطور متعددة"><textarea className={textareaCls + " h-32"} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} /></Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CoverUploader value={form.image_url} onChange={(u) => setForm({ ...form, image_url: u || "" })} folder="services" label="صورة الغلاف الرئيسية" />
                <div className="space-y-3">
                  <Field label="نص بديل للصورة (Alt)"><input className={inputCls} value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.target.value })} /></Field>
                  <Field label="تعليق على الصورة"><input className={inputCls} value={form.image_caption} onChange={(e) => setForm({ ...form, image_caption: e.target.value })} /></Field>
                </div>
              </div>

              <GalleryUploader value={galleryUrls} onChange={setGalleryUrls} folder="services-gallery" label="معرض صور الخدمة (10 صور أو أكثر)" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="النقاط الرئيسية" hint="سطر لكل نقطة"><textarea className={textareaCls + " h-24"} value={toLines(form.bullets)} onChange={(e) => setForm({ ...form, bullets: fromLines(e.target.value) })} /></Field>
                <Field label="المميزات" hint="سطر لكل ميزة"><textarea className={textareaCls + " h-24"} value={toLines(form.features)} onChange={(e) => setForm({ ...form, features: fromLines(e.target.value) })} /></Field>
                <Field label="خطوات العمل" hint="سطر لكل خطوة"><textarea className={textareaCls + " h-24"} value={toLines(form.process_steps)} onChange={(e) => setForm({ ...form, process_steps: fromLines(e.target.value) })} /></Field>
                <Field label="المخرجات (Deliverables)"><textarea className={textareaCls + " h-24"} value={toLines(form.deliverables)} onChange={(e) => setForm({ ...form, deliverables: fromLines(e.target.value) })} /></Field>
                <Field label="أسباب الاختيار"><textarea className={textareaCls + " h-24"} value={toLines(form.reasons)} onChange={(e) => setForm({ ...form, reasons: fromLines(e.target.value) })} /></Field>
                <Field label="الأسئلة الشائعة (سؤال؟ جواب — سطر لكل سؤال)">
                  <textarea
                    className={textareaCls + " h-24"}
                    value={(form.faqs || []).map((f: any) => `${f.q || f.question || ""} — ${f.a || f.answer || ""}`).join("\n")}
                    onChange={(e) => setForm({
                      ...form,
                      faqs: e.target.value.split("\n").map((l) => {
                        const [q, ...a] = l.split("—");
                        return { q: q?.trim() || "", a: a.join("—").trim() };
                      }).filter((x) => x.q),
                    })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="السعر يبدأ من"><input type="number" className={inputCls} value={form.price_from ?? ""} onChange={(e) => setForm({ ...form, price_from: e.target.value })} /></Field>
                <Field label="العملة"><input className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
                <Field label="المدة"><input className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
                <Field label="نص زر الدعوة"><input className={inputCls} value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="شارة التوفر"><input className={inputCls} value={form.availability_badge} onChange={(e) => setForm({ ...form, availability_badge: e.target.value })} /></Field>
                <Field label="عنوان SEO"><input className={inputCls} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></Field>
              </div>
              <Field label="وصف SEO"><textarea className={textareaCls + " h-20"} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></Field>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                منشور على الموقع
              </label>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button disabled={saving} type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} حفظ
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
