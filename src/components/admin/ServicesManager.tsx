import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, ArrowLeft, Eye, EyeOff, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";

type Service = {
  id: string;
  number: string;
  title: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  bullets: string[];
  features: string[];
  process_steps: string[];
  deliverables: string[];
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
  bullets: [],
  features: [],
  process_steps: [],
  deliverables: [],
  faqs: [],
  price_from: null,
  currency: "EGP",
  duration: "",
  sort_order: 0,
  published: true,
};

function toLines(arr: string[]) { return (arr ?? []).join("\n"); }
function fromLines(s: string) { return s.split("\n").map((x) => x.trim()).filter(Boolean); }

function ServiceForm({ item, onClose }: { item: Service | null; onClose: () => void }) {
  const isNew = !item;
  const [form, setForm] = useState<Service>(item ?? empty);
  const [bulletsText, setBulletsText] = useState(toLines(item?.bullets ?? []));
  const [featuresText, setFeaturesText] = useState(toLines(item?.features ?? []));
  const [stepsText, setStepsText] = useState(toLines(item?.process_steps ?? []));
  const [delivText, setDelivText] = useState(toLines(item?.deliverables ?? []));
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
      bullets: fromLines(bulletsText),
      features: fromLines(featuresText),
      process_steps: fromLines(stepsText),
      deliverables: fromLines(delivText),
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
      ? await supabase.from("services").insert(payload)
      : await supabase.from("services").update(payload).eq("id", item!.id);
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else {
      toast.success("تم الحفظ");
      onClose();
    }
  };

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
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

      <div className="grid sm:grid-cols-3 gap-4">
        <input
          required
          maxLength={50}
          placeholder="المعرّف (slug مثل: design)"
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

      <textarea
        rows={3}
        maxLength={1000}
        placeholder="وصف قصير"
        value={form.description ?? ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
      />
      <textarea
        rows={6}
        maxLength={5000}
        placeholder="وصف تفصيلي يظهر في صفحة الخدمة"
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
          placeholder="ما الذي يحصل عليه العميل (deliverables) — سطر لكل عنصر"
          value={delivText}
          onChange={(e) => setDelivText(e.target.value)}
          className="bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
        />
      </div>

      <textarea
        rows={5}
        placeholder="أسئلة شائعة — سطر لكل سؤال بصيغة:  السؤال | الإجابة"
        value={faqsText}
        onChange={(e) => setFaqsText(e.target.value)}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
      />

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
                  <img src={s.image_url} alt="" className="w-full h-full object-cover" />
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
