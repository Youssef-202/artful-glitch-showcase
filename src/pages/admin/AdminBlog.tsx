import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, AlertCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, GalleryUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";
import MarkdownEditor, { normalizeMarkdown } from "./_shared/MarkdownEditor";

const empty: any = {
  title: "", title_en: "", excerpt: "", excerpt_en: "", content: "", content_en: "",
  category: "", category_en: "", author_name: "", author_name_en: "",
  cover_url: "", gallery_urls: [], reading_time: 5, sort_order: 0, featured: false, published: true,
};

export default function AdminBlog() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("blog_posts").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (r: any) => {
    setForm({
      ...empty,
      ...r,
      gallery_urls: r.gallery_urls || [],
      content: normalizeMarkdown(r.content || ""),
      content_en: normalizeMarkdown(r.content_en || ""),
    });
    setEditingId(r.id);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const payload = {
      ...form,
      content: normalizeMarkdown(form.content || ""),
      content_en: normalizeMarkdown(form.content_en || ""),
      reading_time: Number(form.reading_time) || 0,
      sort_order: Number(form.sort_order) || 0,
    };
    const q = editingId
      ? (supabase as any).from("blog_posts").update(payload).eq("id", editingId)
      : (supabase as any).from("blog_posts").insert([payload]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف المقال نهائياً؟")) return;
    const { error } = await (supabase as any).from("blog_posts").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-400" /> المدونة</h3>
        <button onClick={openAdd} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> مقال جديد</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد مقالات.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">العنوان</th><th className="p-3">التصنيف</th><th className="p-3">الكاتب</th><th className="p-3">منشور</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white">{r.title}</td>
                    <td className="p-3 text-slate-400">{r.category || "—"}</td>
                    <td className="p-3 text-slate-400">{r.author_name || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${r.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{r.published ? "نعم" : "لا"}</span></td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
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
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل مقال" : "مقال جديد"}</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="العنوان (عربي) *"><input required className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
                <Field label="Title (English)"><input className={inputCls} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} /></Field>
                <Field label="التصنيف"><input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
                <Field label="Category (English)"><input className={inputCls} value={form.category_en} onChange={(e) => setForm({ ...form, category_en: e.target.value })} /></Field>
                <Field label="اسم الكاتب"><input className={inputCls} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></Field>
                <Field label="Author (English)"><input className={inputCls} value={form.author_name_en} onChange={(e) => setForm({ ...form, author_name_en: e.target.value })} /></Field>
              </div>
              <Field label="مقتطف (عربي)"><textarea className={textareaCls + " h-20"} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
              <Field label="Excerpt (English)"><textarea className={textareaCls + " h-20"} value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} /></Field>
              <Field label="المحتوى (عربي) — محرّر احترافي بمعاينة مباشرة">
                <MarkdownEditor dir="rtl" value={form.content || ""} onChange={(v) => setForm({ ...form, content: v })} minHeight={360} />
              </Field>
              <Field label="Content (English) — Professional editor with live preview">
                <MarkdownEditor dir="ltr" value={form.content_en || ""} onChange={(v) => setForm({ ...form, content_en: v })} minHeight={300} />
              </Field>

              <CoverUploader value={form.cover_url} onChange={(u) => setForm({ ...form, cover_url: u || "" })} folder="blog" />
              <GalleryUploader value={form.gallery_urls} onChange={(u) => setForm({ ...form, gallery_urls: u })} folder="blog-gallery" label="معرض صور المقال (10+ صور)" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="مدة القراءة (دقيقة)"><input type="number" className={inputCls} value={form.reading_time} onChange={(e) => setForm({ ...form, reading_time: e.target.value })} /></Field>
                <Field label="ترتيب العرض"><input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
                <label className="flex items-center gap-2 text-sm text-slate-300 mt-6"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> مميّز</label>
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
