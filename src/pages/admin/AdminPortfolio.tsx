import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, GalleryUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

const empty: any = {
  title_ar: "", title_en: "", client_ar: "", client_en: "", category: "",
  description_ar: "", description_en: "", content_ar: "", content_en: "",
  cover_url: "", gallery_urls: [], process_steps_ar: [], process_steps_en: [],
  project_url: "", duration: "", year: "", color: "#06b6d4", accent: "#ec4899",
  sort_order: 0, published: true,
  home_title_ar: "", home_title_en: "", home_client_ar: "", home_client_en: "", home_cover_url: "",
};

const toLines = (a: any) => (Array.isArray(a) ? a.join("\n") : "");
const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function AdminPortfolio() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("portfolio_items").select("*").order("sort_order");
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const newOrder = Number(form.sort_order) || 0;
    const payload = { ...form, sort_order: newOrder };

    // Swap logic: if editing and changing sort_order to a value used by another row,
    // give that other row the old sort_order (swap positions).
    if (editingId) {
      const current = rows.find((r) => r.id === editingId);
      const oldOrder = Number(current?.sort_order ?? 0);
      if (oldOrder !== newOrder) {
        const conflicts = rows.filter((r) => r.id !== editingId && Number(r.sort_order ?? 0) === newOrder);
        if (conflicts.length > 0) {
          // Move conflicting rows to a temp value first to avoid unique-constraint issues, then to oldOrder.
          const TEMP = -1000000;
          for (const c of conflicts) {
            await (supabase as any).from("portfolio_items").update({ sort_order: TEMP }).eq("id", c.id);
          }
          for (const c of conflicts) {
            await (supabase as any).from("portfolio_items").update({ sort_order: oldOrder }).eq("id", c.id);
          }
        }
      }
    }

    const q = editingId
      ? (supabase as any).from("portfolio_items").update(payload).eq("id", editingId)
      : (supabase as any).from("portfolio_items").insert([payload]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف المشروع؟")) return;
    const { error } = await (supabase as any).from("portfolio_items").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><ImageIcon className="w-5 h-5 text-cyan-400" /> الأعمال</h3>
        <button onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> مشروع جديد</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد مشاريع.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3 w-16 text-center">الترتيب</th><th className="p-3">العنوان</th><th className="p-3">العميل</th><th className="p-3">التصنيف</th><th className="p-3">السنة</th><th className="p-3">منشور</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">{r.sort_order ?? 0}</span></td>
                    <td className="p-3 font-bold text-white">{r.title_ar}</td>
                    <td className="p-3 text-slate-400">{r.client_ar || "—"}</td>
                    <td className="p-3 text-slate-400">{r.category || "—"}</td>
                    <td className="p-3 text-slate-400">{r.year || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${r.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{r.published ? "نعم" : "لا"}</span></td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm({ ...empty, ...r, gallery_urls: r.gallery_urls || [], process_steps_ar: r.process_steps_ar || [], process_steps_en: r.process_steps_en || [] }); setEditingId(r.id); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel max-w-4xl w-full rounded-2xl my-4">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل مشروع" : "مشروع جديد"}</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="العنوان (عربي) *"><input required className={inputCls} value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} /></Field>
                <Field label="Title (English)"><input className={inputCls} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></Field>
                <Field label="اسم العميل"><input className={inputCls} value={form.client_ar} onChange={(e) => setForm({ ...form, client_ar: e.target.value })} /></Field>
                <Field label="Client (English)"><input className={inputCls} value={form.client_en} onChange={(e) => setForm({ ...form, client_en: e.target.value })} /></Field>
                <Field label="التصنيف"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
                <Field label="رابط المشروع"><input className={inputCls} value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} /></Field>
                <Field label="المدة"><input className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
                <Field label="السنة"><input className={inputCls} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
                <Field label="اللون الأساسي"><input type="color" className={inputCls + " h-10"} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
                <Field label="اللون المميز"><input type="color" className={inputCls + " h-10"} value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} /></Field>
              </div>
              <Field label="وصف مختصر (عربي)"><textarea className={textareaCls + " h-20"} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></Field>
              <Field label="Description (English)"><textarea className={textareaCls + " h-20"} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} /></Field>
              <Field label="المحتوى الكامل (عربي)"><textarea className={textareaCls + " h-32"} value={form.content_ar} onChange={(e) => setForm({ ...form, content_ar: e.target.value })} /></Field>
              <Field label="Content (English)"><textarea className={textareaCls + " h-32"} value={form.content_en} onChange={(e) => setForm({ ...form, content_en: e.target.value })} /></Field>

              <CoverUploader value={form.cover_url} onChange={(u) => setForm({ ...form, cover_url: u || "" })} folder="portfolio" />
              <GalleryUploader value={form.gallery_urls} onChange={(u) => setForm({ ...form, gallery_urls: u })} folder="portfolio-gallery" label="معرض صور المشروع (10+ صور)" />

              <div className="border border-cyan-500/30 bg-cyan-500/5 rounded-xl p-4 space-y-4">
                <div className="border-r-2 border-cyan-400/60 pr-3">
                  <h5 className="font-bold text-white text-sm">كرت المشروع داخل الصفحة الرئيسية</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    هذه الحقول تتحكم في الكرت الظاهر داخل شرائح الأعمال في الصفحة الرئيسية فقط — منفصلة عن صفحة تفاصيل المشروع. اترك أي حقل فارغاً لاستخدام قيم صفحة التفاصيل.
                  </p>
                </div>
                <CoverUploader
                  value={form.home_cover_url}
                  onChange={(u) => setForm({ ...form, home_cover_url: u || "" })}
                  folder="portfolio-home"
                  label="غلاف الكرت في الصفحة الرئيسية"
                />
                <Field label="أو ألصق رابط صورة مباشرة">
                  <input className={inputCls} placeholder="https://..." value={form.home_cover_url || ""} onChange={(e) => setForm({ ...form, home_cover_url: e.target.value })} />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="عنوان الكرت (عربي)"><input className={inputCls} value={form.home_title_ar || ""} onChange={(e) => setForm({ ...form, home_title_ar: e.target.value })} /></Field>
                  <Field label="Home Title (English)"><input className={inputCls} value={form.home_title_en || ""} onChange={(e) => setForm({ ...form, home_title_en: e.target.value })} /></Field>
                  <Field label="اسم العميل في الكرت (عربي)"><input className={inputCls} value={form.home_client_ar || ""} onChange={(e) => setForm({ ...form, home_client_ar: e.target.value })} /></Field>
                  <Field label="Home Client (English)"><input className={inputCls} value={form.home_client_en || ""} onChange={(e) => setForm({ ...form, home_client_en: e.target.value })} /></Field>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="خطوات العمل (عربي)" hint="سطر لكل خطوة"><textarea className={textareaCls + " h-24"} value={toLines(form.process_steps_ar)} onChange={(e) => setForm({ ...form, process_steps_ar: fromLines(e.target.value) })} /></Field>
                <Field label="Process steps (English)"><textarea className={textareaCls + " h-24"} value={toLines(form.process_steps_en)} onChange={(e) => setForm({ ...form, process_steps_en: fromLines(e.target.value) })} /></Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="ترتيب العرض"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
                <label className="flex items-center gap-2 text-sm text-slate-300 mt-6"><input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> منشور</label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button disabled={saving} type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />} حفظ</button>
                <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
