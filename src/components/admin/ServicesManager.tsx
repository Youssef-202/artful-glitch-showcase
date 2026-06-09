import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, ArrowLeft, Eye, EyeOff, Wrench, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";

type GalleryItem = { url: string; alt?: string; caption?: string };

type Service = {
  id: string;
  number: string;
  title: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_caption: string | null;
  image_height: number;
  image_fit: "cover" | "contain";
  gallery: GalleryItem[];
  hero_subtitle: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cta_text: string | null;
  availability_badge: string | null;
  summary_title: string | null;
  overview_title: string | null;
  features_title: string | null;
  process_title: string | null;
  deliverables_title: string | null;
  faqs_title: string | null;
  reasons_title: string | null;
  cta_section_title: string | null;
  cta_section_description: string | null;
  bullets: string[];
  features: string[];
  process_steps: string[];
  deliverables: string[];
  reasons: string[];
  faqs: { q: string; a: string }[];
  price_from: number | null;
  currency: string;
  duration: string | null;
  sort_order: number;
  published: boolean;
};

const empty: Service = {
  id: "",
  number: "00",
  title: "",
  tagline: "",
  description: "",
  long_description: "",
  image_url: "",
  image_alt: "",
  image_caption: "",
  image_height: 420,
  image_fit: "cover",
  gallery: [],
  hero_subtitle: "",
  seo_title: "",
  seo_description: "",
  cta_text: "",
  availability_badge: "",
  summary_title: "",
  overview_title: "",
  features_title: "",
  process_title: "",
  deliverables_title: "",
  faqs_title: "",
  reasons_title: "",
  cta_section_title: "",
  cta_section_description: "",
  bullets: [],
  features: [],
  process_steps: [],
  deliverables: [],
  reasons: [],
  faqs: [],
  price_from: null,
  currency: "EGP",
  duration: "",
  sort_order: 0,
  published: true,
};

function toLines(arr: string[]) { return (arr ?? []).join("\n"); }
function fromLines(s: string) { return s.split("\n").map((x) => x.trim()).filter(Boolean); }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/30 p-5 space-y-4">
      <h3 className="font-black text-sm text-accent flex items-center gap-2">
        <span className="w-1 h-4 bg-accent rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function GalleryEditor({ gallery, onChange }: { gallery: GalleryItem[]; onChange: (g: GalleryItem[]) => void }) {
  const update = (i: number, patch: Partial<GalleryItem>) => {
    const next = [...gallery];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(gallery.filter((_, idx) => idx !== i));
  const add = () => onChange([...gallery, { url: "", alt: "", caption: "" }]);

  return (
    <div className="space-y-3">
      {gallery.map((g, i) => (
        <div key={i} className="rounded-xl border border-border/60 p-3 space-y-2 bg-background/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">صورة #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-destructive p-1 hover:bg-destructive/10 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUpload
            value={g.url}
            onChange={(url) => update(i, { url: url ?? "" })}
            folder="services/gallery"
            accept="image/*"
            label="صورة"
          />
          <input
            type="url"
            placeholder="أو رابط مباشر"
            value={g.url}
            onChange={(e) => update(i, { url: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 outline-none focus:border-primary text-xs"
          />
          <input
            placeholder="نص بديل (alt) — للـ SEO وقارئات الشاشة"
            value={g.alt ?? ""}
            onChange={(e) => update(i, { alt: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
          />
          <input
            placeholder="تعليق يظهر تحت الصورة (caption)"
            value={g.caption ?? ""}
            onChange={(e) => update(i, { caption: e.target.value })}
            className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 text-primary py-3 hover:bg-primary/5 transition text-sm"
      >
        <Plus className="w-4 h-4" /> إضافة صورة للمعرض
      </button>
    </div>
  );
}

function ServiceForm({ item, onClose }: { item: Service | null; onClose: () => void }) {
  const isNew = !item;
  const [form, setForm] = useState<Service>(item ? { ...empty, ...item } : empty);
  const [bulletsText, setBulletsText] = useState(toLines(item?.bullets ?? []));
  const [featuresText, setFeaturesText] = useState(toLines(item?.features ?? []));
  const [stepsText, setStepsText] = useState(toLines(item?.process_steps ?? []));
  const [delivText, setDelivText] = useState(toLines(item?.deliverables ?? []));
  const [reasonsText, setReasonsText] = useState(toLines(item?.reasons ?? []));
  const [faqsText, setFaqsText] = useState(
    (item?.faqs ?? []).map((f) => `${f.q}|${f.a}`).join("\n")
  );
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id.trim() || !form.title.trim()) {
      toast.error("المعرّف والعنوان مطلوبان");
      return;
    }
    setBusy(true);
    const payload = {
      id: form.id.trim(),
      number: form.number || "00",
      title: form.title.trim(),
      tagline: form.tagline || null,
      description: form.description || null,
      long_description: form.long_description || null,
      image_url: form.image_url || null,
      image_alt: form.image_alt || null,
      image_caption: form.image_caption || null,
      image_height: Number(form.image_height) || 420,
      image_fit: form.image_fit === "contain" ? "contain" : "cover",
      gallery: (form.gallery ?? []).filter((g) => g.url),
      hero_subtitle: form.hero_subtitle || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      cta_text: form.cta_text || null,
      availability_badge: form.availability_badge || null,
      summary_title: form.summary_title || null,
      overview_title: form.overview_title || null,
      features_title: form.features_title || null,
      process_title: form.process_title || null,
      deliverables_title: form.deliverables_title || null,
      faqs_title: form.faqs_title || null,
      reasons_title: form.reasons_title || null,
      cta_section_title: form.cta_section_title || null,
      cta_section_description: form.cta_section_description || null,
      bullets: fromLines(bulletsText),
      features: fromLines(featuresText),
      process_steps: fromLines(stepsText),
      deliverables: fromLines(delivText),
      reasons: fromLines(reasonsText),
      faqs: faqsText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [q, ...rest] = l.split("|");
          return { q: q.trim(), a: rest.join("|").trim() };
        })
        .filter((f) => f.q),
      price_from: form.price_from === null || form.price_from === ("" as any) ? null : Number(form.price_from),
      currency: form.currency || "EGP",
      duration: form.duration || null,
      sort_order: Number(form.sort_order) || 0,
      published: !!form.published,
    };
    const res = isNew
      ? await supabase.from("services").insert(payload as any)
      : await supabase.from("services").update(payload as any).eq("id", item!.id);
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success("تم الحفظ");
      onClose();
    }
  };

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black">
          <span className="text-gradient">{isNew ? "خدمة جديدة" : "تعديل خدمة"}</span>
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> إلغاء
        </button>
      </div>

      {/* أساسي */}
      <Section title="معلومات أساسية">
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            required
            maxLength={50}
            placeholder="المعرّف (slug)"
            value={form.id}
            disabled={!isNew}
            onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
          />
          <input
            maxLength={5}
            placeholder="الرقم (مثال: 01)"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="الترتيب"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <input
          required
          maxLength={200}
          placeholder="عنوان الخدمة"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-lg font-bold"
        />
        <input
          maxLength={200}
          placeholder="عبارة جذابة (tagline)"
          value={form.tagline ?? ""}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
        />
        <input
          maxLength={300}
          placeholder="عنوان فرعي إضافي في الهيرو (اختياري)"
          value={form.hero_subtitle ?? ""}
          onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
        />
      </Section>

      {/* الصورة الرئيسية */}
      <Section title="الصورة الرئيسية (الهيرو)">
        <FileUpload
          value={form.image_url ?? ""}
          onChange={(url) => setForm({ ...form, image_url: url ?? "" })}
          folder="services"
          accept="image/*"
          label="صورة الخدمة"
        />
        <input
          type="url"
          placeholder="أو رابط صورة مباشر"
          value={form.image_url ?? ""}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs"
        />
        <input
          maxLength={200}
          placeholder="النص البديل (alt) للصورة — مهم للـ SEO"
          value={form.image_alt ?? ""}
          onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
        />
        <input
          maxLength={300}
          placeholder="تعليق يظهر تحت الصورة (caption)"
          value={form.image_caption ?? ""}
          onChange={(e) => setForm({ ...form, image_caption: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">طريقة عرض الصورة</span>
            <select
              value={form.image_fit}
              onChange={(e) => setForm({ ...form, image_fit: e.target.value as "cover" | "contain" })}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            >
              <option value="cover">تغطية كاملة (قد تُقص)</option>
              <option value="contain">إظهار كامل الصورة (بدون قص)</option>
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">ارتفاع الصورة: {form.image_height}px</span>
            <input
              type="range"
              min={200}
              max={800}
              step={10}
              value={form.image_height}
              onChange={(e) => setForm({ ...form, image_height: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </label>
        </div>
      </Section>

      {/* معرض الصور */}
      <Section title="معرض صور الخدمة (Gallery)">
        <p className="text-xs text-muted-foreground">يظهر داخل صفحة الخدمة. يمكنك إضافة عدة صور لكل خدمة.</p>
        <GalleryEditor
          gallery={form.gallery ?? []}
          onChange={(g) => setForm({ ...form, gallery: g })}
        />
      </Section>

      {/* النصوص */}
      <Section title="الأوصاف والنصوص">
        <textarea
          rows={3}
          maxLength={1000}
          placeholder="وصف قصير (يظهر في قائمة الخدمات)"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
        />
        <textarea
          rows={8}
          maxLength={10000}
          placeholder="وصف تفصيلي يظهر في صفحة الخدمة (يمكن كتابة عدة فقرات)"
          value={form.long_description ?? ""}
          onChange={(e) => setForm({ ...form, long_description: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <textarea
            rows={5}
            placeholder="نقاط مختصرة (سطر لكل نقطة)"
            value={bulletsText}
            onChange={(e) => setBulletsText(e.target.value)}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
          />
          <textarea
            rows={5}
            placeholder="المزايا التفصيلية (سطر لكل ميزة)"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
          />
          <textarea
            rows={5}
            placeholder="خطوات التنفيذ (سطر لكل خطوة)"
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
          />
          <textarea
            rows={5}
            placeholder="هتحصل على (deliverables) — سطر لكل عنصر"
            value={delivText}
            onChange={(e) => setDelivText(e.target.value)}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
          />
        </div>
        <textarea
          rows={5}
          placeholder='لماذا تختار هذه الخدمة؟ (سطر لكل سبب)'
          value={reasonsText}
          onChange={(e) => setReasonsText(e.target.value)}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
        />
        <textarea
          rows={5}
          placeholder="أسئلة شائعة — سطر لكل سؤال: السؤال | الإجابة"
          value={faqsText}
          onChange={(e) => setFaqsText(e.target.value)}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
        />
      </Section>

      {/* عناوين الأقسام (تخصيص) */}
      <Section title="عناوين الأقسام (اتركها فارغة لاستخدام الافتراضي)">
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder='عنوان قسم "ملخص الخدمة"' value={form.summary_title ?? ""} onChange={(e) => setForm({ ...form, summary_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "نظرة عامة"' value={form.overview_title ?? ""} onChange={(e) => setForm({ ...form, overview_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "المزايا"' value={form.features_title ?? ""} onChange={(e) => setForm({ ...form, features_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "خطوات التنفيذ"' value={form.process_title ?? ""} onChange={(e) => setForm({ ...form, process_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "هتحصل على"' value={form.deliverables_title ?? ""} onChange={(e) => setForm({ ...form, deliverables_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "أسئلة شائعة"' value={form.faqs_title ?? ""} onChange={(e) => setForm({ ...form, faqs_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "لماذا تختار هذه الخدمة"' value={form.reasons_title ?? ""} onChange={(e) => setForm({ ...form, reasons_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='عنوان قسم "جاهز نبدأ معاك"' value={form.cta_section_title ?? ""} onChange={(e) => setForm({ ...form, cta_section_title: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <textarea
          rows={2}
          placeholder='نص وصفي لقسم الـ CTA'
          value={form.cta_section_description ?? ""}
          onChange={(e) => setForm({ ...form, cta_section_description: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder='نص شارة "متاحة الآن للطلب"' value={form.availability_badge ?? ""} onChange={(e) => setForm({ ...form, availability_badge: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder='نص زر CTA الرئيسي' value={form.cta_text ?? ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO (تحسين محركات البحث)">
        <input
          maxLength={200}
          placeholder="عنوان الصفحة في محركات البحث (Meta Title)"
          value={form.seo_title ?? ""}
          onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"
        />
        <textarea
          rows={3}
          maxLength={300}
          placeholder="وصف الصفحة في محركات البحث (Meta Description)"
          value={form.seo_description ?? ""}
          onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
        />
      </Section>

      {/* سعر ومدة */}
      <Section title="السعر والمدة">
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="السعر يبدأ من"
            value={form.price_from ?? ""}
            onChange={(e) => setForm({ ...form, price_from: e.target.value === "" ? null : Number(e.target.value) })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
          <input
            maxLength={10}
            placeholder="العملة"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
          <input
            maxLength={50}
            placeholder="المدة (مثال: 4 أسابيع)"
            value={form.duration ?? ""}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
          />
        </div>
      </Section>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        منشور
      </label>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> حفظ الخدمة
      </button>
    </form>
  );
}

export default function ServicesManager() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems(((data as any) ?? []) as Service[]));
  }, [tick]);

  const remove = async (id: string) => {
    if (!confirm("حذف الخدمة نهائياً؟")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("✓");
      setTick((t) => t + 1);
    }
  };

  if (creating || editing) {
    return (
      <ServiceForm
        item={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          setTick((t) => t + 1);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-black inline-flex items-center gap-2">
          <Wrench className="w-7 h-7 text-primary" />
          <span className="text-gradient">الخدمات</span>
        </h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> خدمة جديدة
        </button>
      </div>

      <div className="glass-strong rounded-3xl overflow-hidden">
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-foreground/5"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.image_alt ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-primary text-sm">{s.number}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold truncate">
                    {s.number} — {s.title}
                  </p>
                  {s.published ? (
                    <Eye className="w-3 h-3 text-primary" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                  {s.gallery && s.gallery.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-accent">
                      <ImageIcon className="w-3 h-3" /> {s.gallery.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {s.tagline ?? s.description ?? s.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(s)}
                className="p-2 rounded-lg hover:bg-primary/10 text-primary"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(s.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-12">لا توجد خدمات بعد</p>
        )}
      </div>
    </div>
  );
}
