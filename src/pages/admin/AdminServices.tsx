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
        <ServiceEditor
          form={form}
          setForm={setForm}
          galleryUrls={galleryUrls}
          setGalleryUrls={setGalleryUrls}
          editingId={editingId}
          saving={saving}
          onClose={() => setOpen(false)}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

/* ============================== Editor ============================== */

type TabKey =
  | "basics"
  | "content"
  | "details"
  | "faqs"
  | "media"
  | "pricing"
  | "sections"
  | "seo";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "basics", label: "الأساسيات", hint: "المعرّف، العنوان، الحالة" },
  { key: "content", label: "المحتوى", hint: "الأوصاف والعناوين الرئيسية" },
  { key: "details", label: "النقاط والتفاصيل", hint: "المميزات، الخطوات، المخرجات" },
  { key: "faqs", label: "الأسئلة الشائعة", hint: "أسئلة وأجوبة منسّقة" },
  { key: "media", label: "الوسائط والصور", hint: "الغلاف ومعرض الصور" },
  { key: "pricing", label: "التسعير والدعوة", hint: "السعر، المدة، زر CTA" },
  { key: "sections", label: "عناوين الأقسام", hint: "تخصيص عناوين كل قسم بالصفحة" },
  { key: "seo", label: "تحسين محركات البحث", hint: "Meta title و description" },
];

function ServiceEditor({
  form,
  setForm,
  galleryUrls,
  setGalleryUrls,
  editingId,
  saving,
  onClose,
  onSubmit,
}: any) {
  const [tab, setTab] = useState<TabKey>("basics");
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const faqs: { q: string; a: string }[] = Array.isArray(form.faqs) ? form.faqs : [];
  const setFaqs = (next: any[]) => set("faqs", next);

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="cyber-panel w-full max-w-6xl my-4 mx-4 rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/95">
          <div>
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              {editingId ? "تعديل خدمة" : "إضافة خدمة جديدة"}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {TABS.find((t) => t.key === tab)?.hint}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-slate-800 bg-slate-950/60">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition ${
                tab === t.key
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 border border-transparent hover:text-cyan-300 hover:bg-slate-900/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ============ Basics ============ */}
          {tab === "basics" && (
            <Section title="الأساسيات" desc="معرّف فريد للخدمة، الترتيب على الصفحة، وحالة النشر.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="المعرّف (slug)" hint="يستخدم في الـ URL. مثال: branding">
                  <input className={inputCls} value={form.id} onChange={(e) => set("id", e.target.value)} disabled={!!editingId} />
                </Field>
                <Field label="الرقم التعريفي" hint="رقم العرض داخل القائمة">
                  <input className={inputCls} value={form.number} onChange={(e) => set("number", e.target.value)} />
                </Field>
                <Field label="ترتيب العرض" hint="الأقل يظهر أولاً">
                  <input type="number" className={inputCls} value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="عنوان الخدمة *" hint="اسم الخدمة كما يظهر للزائر">
                  <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
                </Field>
                <Field label="العنوان الفرعي (Tagline)" hint="جملة قصيرة تحت العنوان">
                  <input className={inputCls} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Field label="شارة التوفر" hint="مثل: متاح الآن / قريباً">
                  <input className={inputCls} value={form.availability_badge} onChange={(e) => set("availability_badge", e.target.value)} />
                </Field>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer h-10">
                  <input type="checkbox" checked={!!form.published} onChange={(e) => set("published", e.target.checked)} />
                  <span>منشور على الموقع</span>
                </label>
              </div>
            </Section>
          )}

          {/* ============ Content ============ */}
          {tab === "content" && (
            <Section title="نصوص الخدمة" desc="الأوصاف التي تظهر في صفحة الخدمة بكل مستوياتها.">
              <Field label="وصف مختصر" hint="يظهر في الكروت الرئيسية بالصفحة الرئيسية وقائمة الخدمات">
                <textarea className={textareaCls + " h-20"} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="عنوان البطل (Hero Subtitle)" hint="نص تحت عنوان صفحة الخدمة الداخلية">
                <input className={inputCls} value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
              </Field>
              <Field label="الوصف المطوّل" hint="يدعم سطور متعددة — يظهر داخل صفحة الخدمة">
                <textarea className={textareaCls + " h-40"} value={form.long_description} onChange={(e) => set("long_description", e.target.value)} />
              </Field>
            </Section>
          )}

          {/* ============ Details ============ */}
          {tab === "details" && (
            <Section title="التفاصيل والقوائم" desc="كل قائمة: سطر = عنصر مستقل. تنسيق تلقائي بالموقع.">
              <ListField label="النقاط الرئيسية" hint="سطر لكل نقطة" value={form.bullets} onChange={(v) => set("bullets", v)} />
              <ListField label="المميزات" hint="سطر لكل ميزة" value={form.features} onChange={(v) => set("features", v)} />
              <ListField label="خطوات العمل" hint="سطر لكل خطوة بالترتيب" value={form.process_steps} onChange={(v) => set("process_steps", v)} />
              <ListField label="المخرجات (Deliverables)" hint="ما يستلمه العميل بنهاية الخدمة" value={form.deliverables} onChange={(v) => set("deliverables", v)} />
              <ListField label="أسباب الاختيار" hint="لماذا يختاروا هذه الخدمة" value={form.reasons} onChange={(v) => set("reasons", v)} />
            </Section>
          )}

          {/* ============ FAQs ============ */}
          {tab === "faqs" && (
            <Section title="الأسئلة الشائعة" desc="أضف أو احذف أسئلة بشكل منفصل لكل سؤال.">
              <div className="space-y-3">
                {faqs.length === 0 && (
                  <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center text-slate-500 text-xs">
                    لا توجد أسئلة بعد. اضغط "إضافة سؤال" بالأسفل.
                  </div>
                )}
                {faqs.map((f, i) => (
                  <div key={i} className="border border-slate-800 rounded-lg p-3 bg-slate-900/40 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-cyan-300 font-mono">سؤال #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      className={inputCls}
                      placeholder="السؤال"
                      value={f.q || ""}
                      onChange={(e) => {
                        const c = [...faqs]; c[i] = { ...c[i], q: e.target.value }; setFaqs(c);
                      }}
                    />
                    <textarea
                      className={textareaCls + " h-20"}
                      placeholder="الإجابة"
                      value={f.a || ""}
                      onChange={(e) => {
                        const c = [...faqs]; c[i] = { ...c[i], a: e.target.value }; setFaqs(c);
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
                  className="w-full py-2 border border-dashed border-cyan-500/40 text-cyan-300 rounded-lg text-xs hover:bg-cyan-500/5 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة سؤال
                </button>
              </div>
            </Section>
          )}

          {/* ============ Media ============ */}
          {tab === "media" && (
            <Section title="الوسائط" desc="صورة الغلاف الرئيسية وبيانات SEO الخاصة بها + معرض صور كامل (10 صور أو أكثر).">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CoverUploader value={form.image_url} onChange={(u) => set("image_url", u || "")} folder="services" label="صورة الغلاف الرئيسية" />
                <div className="space-y-3">
                  <Field label="نص بديل للصورة (Alt)" hint="مهم لـ SEO وإمكانية الوصول">
                    <input className={inputCls} value={form.image_alt} onChange={(e) => set("image_alt", e.target.value)} />
                  </Field>
                  <Field label="تعليق على الصورة (Caption)">
                    <input className={inputCls} value={form.image_caption} onChange={(e) => set("image_caption", e.target.value)} />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="ارتفاع الصورة (px)" hint="اختياري — لتخصيص العرض">
                  <input type="number" className={inputCls} value={form.image_height ?? ""} onChange={(e) => set("image_height", e.target.value)} />
                </Field>
                <Field label="طريقة العرض (image fit)" hint="cover / contain / fill">
                  <input className={inputCls} value={form.image_fit || ""} onChange={(e) => set("image_fit", e.target.value)} placeholder="cover" />
                </Field>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <GalleryUploader
                  value={galleryUrls}
                  onChange={setGalleryUrls}
                  folder="services-gallery"
                  label="معرض صور الخدمة (10 صور أو أكثر)"
                />
              </div>
            </Section>
          )}

          {/* ============ Pricing ============ */}
          {tab === "pricing" && (
            <Section title="التسعير والدعوة لاتخاذ إجراء" desc="السعر، المدة، ونصوص قسم الدعوة (CTA) أسفل الصفحة.">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="السعر يبدأ من">
                  <input type="number" className={inputCls} value={form.price_from ?? ""} onChange={(e) => set("price_from", e.target.value)} />
                </Field>
                <Field label="العملة" hint="مثل: EGP / USD">
                  <input className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
                </Field>
                <Field label="المدة" hint="مثل: 7 أيام">
                  <input className={inputCls} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
                </Field>
                <Field label="نص زر الدعوة" hint="مثال: اطلب الآن">
                  <input className={inputCls} value={form.cta_text} onChange={(e) => set("cta_text", e.target.value)} />
                </Field>
              </div>
              <Field label="عنوان قسم الـ CTA بأسفل الصفحة">
                <input className={inputCls} value={form.cta_section_title || ""} onChange={(e) => set("cta_section_title", e.target.value)} />
              </Field>
              <Field label="وصف قسم الـ CTA بأسفل الصفحة">
                <textarea className={textareaCls + " h-24"} value={form.cta_section_description || ""} onChange={(e) => set("cta_section_description", e.target.value)} />
              </Field>
            </Section>
          )}

          {/* ============ Section titles ============ */}
          {tab === "sections" && (
            <Section title="عناوين الأقسام داخل الصفحة" desc="تخصيص عنوان كل قسم يظهر داخل صفحة الخدمة (اتركها فارغة للقيمة الافتراضية).">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="عنوان قسم الملخص"><input className={inputCls} value={form.summary_title || ""} onChange={(e) => set("summary_title", e.target.value)} /></Field>
                <Field label="عنوان قسم النظرة العامة"><input className={inputCls} value={form.overview_title || ""} onChange={(e) => set("overview_title", e.target.value)} /></Field>
                <Field label="عنوان قسم المميزات"><input className={inputCls} value={form.features_title || ""} onChange={(e) => set("features_title", e.target.value)} /></Field>
                <Field label="عنوان قسم خطوات العمل"><input className={inputCls} value={form.process_title || ""} onChange={(e) => set("process_title", e.target.value)} /></Field>
                <Field label="عنوان قسم المخرجات"><input className={inputCls} value={form.deliverables_title || ""} onChange={(e) => set("deliverables_title", e.target.value)} /></Field>
                <Field label="عنوان قسم الأسئلة الشائعة"><input className={inputCls} value={form.faqs_title || ""} onChange={(e) => set("faqs_title", e.target.value)} /></Field>
                <Field label="عنوان قسم أسباب الاختيار"><input className={inputCls} value={form.reasons_title || ""} onChange={(e) => set("reasons_title", e.target.value)} /></Field>
              </div>
            </Section>
          )}

          {/* ============ SEO ============ */}
          {tab === "seo" && (
            <Section title="تحسين محركات البحث (SEO)" desc="بيانات meta الخاصة بصفحة الخدمة.">
              <Field label="عنوان SEO" hint="حتى 60 حرف للأفضل">
                <input className={inputCls} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
              </Field>
              <Field label="وصف SEO" hint="حتى 160 حرف للأفضل">
                <textarea className={textareaCls + " h-24"} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
              </Field>
            </Section>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            القسم الحالي: <span className="text-cyan-300">{TABS.find((t) => t.key === tab)?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm">
              إلغاء
            </button>
            <button
              disabled={saving}
              type="button"
              onClick={onSubmit}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} حفظ الخدمة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-r-2 border-cyan-400/60 pr-3">
        <h5 className="font-bold text-white text-sm">{title}</h5>
        {desc && <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ListField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string[] | undefined | null;
  onChange: (v: string[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-slate-200 text-xs font-semibold">{label}</label>
          {hint && <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="px-2 py-1 text-[11px] rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> إضافة
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px] text-slate-500 py-2 text-center border border-dashed border-slate-800 rounded">
          فارغ — أضف عنصر أول.
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono w-6 text-center">{i + 1}</span>
              <input
                className={inputCls}
                value={it}
                onChange={(e) => {
                  const c = [...items]; c[i] = e.target.value; onChange(c);
                }}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

