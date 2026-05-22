import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { FileUpload } from "@/components/FileUpload";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  sort_order: number;
  published: boolean;
};

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  quote: z.string().trim().min(1).max(800),
  avatar_url: z.string().trim().url().optional().or(z.literal("")),
  sort_order: z.number().int(),
  published: z.boolean(),
});

export default function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems((data as any) ?? []));
  }, [tick]);

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("✓"); setTick((t) => t + 1); }
  };

  if (creating || editing) {
    return (
      <Form
        item={editing}
        onClose={() => { setEditing(null); setCreating(false); setTick((t) => t + 1); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black"><span className="text-gradient">شركاء النجاح</span></h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> إضافة رأي
        </button>
      </div>
      <div className="glass-strong rounded-3xl overflow-hidden">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-foreground/5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full shrink-0 overflow-hidden bg-background/40 flex items-center justify-center">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <MessageSquare className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold truncate">{p.name}</p>
                  {p.published ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground truncate max-w-md">{p.role} · {p.quote}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد آراء بعد</p>}
      </div>
    </div>
  );
}

function Form({ item, onClose }: { item: Testimonial | null; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    role: item?.role ?? "",
    quote: item?.quote ?? "",
    avatar_url: item?.avatar_url ?? "",
    sort_order: item?.sort_order ?? 0,
    published: item?.published ?? true,
  });
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const payload = {
      name: parsed.data.name,
      role: parsed.data.role || null,
      quote: parsed.data.quote,
      avatar_url: parsed.data.avatar_url || null,
      sort_order: parsed.data.sort_order,
      published: parsed.data.published,
    };
    const res = item
      ? await supabase.from("testimonials").update(payload).eq("id", item.id)
      : await supabase.from("testimonials").insert({ ...payload, created_by: user?.id });
    setBusy(false);
    if (res.error) toast.error(res.error.message);
    else { toast.success("✓"); onClose(); }
  };

  return (
    <form onSubmit={save} className="glass-strong rounded-3xl p-8 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black"><span className="text-gradient">{item ? "تعديل رأي" : "رأي جديد"}</span></h1>
        <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> إلغاء
        </button>
      </div>
      <input required maxLength={120} placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-lg font-bold" />
      <input maxLength={120} placeholder="المسمى الوظيفي / الشركة" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
      <textarea required maxLength={800} rows={4} placeholder="نص الرأي" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none" />
      <FileUpload value={form.avatar_url} onChange={(url) => setForm({ ...form, avatar_url: url ?? "" })} folder="testimonials" accept="image/*" label="صورة شخصية" />
      <input type="url" placeholder="رابط الصورة (اختياري)" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs" />
      <input type="number" placeholder="الترتيب" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        منشور
      </label>
      <button type="submit" disabled={busy}
        className="w-full rounded-full px-7 py-4 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        حفظ
      </button>
    </form>
  );
}
