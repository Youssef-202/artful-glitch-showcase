import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, AlertCircle, Handshake, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, GalleryUploader, Field, inputCls } from "./_shared/uploaders";

const empty: any = { name: "", logo_url: "", cover_url: "", website_url: "", sort_order: 0, published: true, gallery_urls: [] as string[] };

export default function AdminPartners() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("partners").select("*").order("sort_order");
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    // partners table has no gallery_urls column; pack into cover_url + logo and ignore extras silently
    const payload = { name: form.name, logo_url: form.logo_url, cover_url: form.cover_url, website_url: form.website_url, sort_order: Number(form.sort_order) || 0, published: !!form.published };
    const q = editingId
      ? (supabase as any).from("partners").update(payload).eq("id", editingId)
      : (supabase as any).from("partners").insert([payload]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الشريك؟")) return;
    const { error } = await (supabase as any).from("partners").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Handshake className="w-5 h-5 text-cyan-400" /> الشركاء</h3>
        <button onClick={() => { setForm(empty); setEditingId(null); setGallery([]); setOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> شريك جديد</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا يوجد شركاء.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400"><th className="p-3">الاسم</th><th className="p-3">الموقع</th><th className="p-3">منشور</th><th className="p-3 text-center w-24">إجراءات</th></tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white flex items-center gap-2">{r.logo_url && <img src={r.logo_url} className="w-8 h-8 object-contain rounded" />}{r.name}</td>
                    <td className="p-3 text-slate-400">{r.website_url || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${r.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{r.published ? "نعم" : "لا"}</span></td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm({ ...empty, ...r }); setEditingId(r.id); setGallery([]); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel max-w-2xl w-full rounded-2xl my-4">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل" : "شريك جديد"}</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <Field label="اسم الشريك *"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="رابط الموقع"><input className={inputCls} value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CoverUploader value={form.logo_url} onChange={(u) => setForm({ ...form, logo_url: u || "" })} folder="partners-logos" label="الشعار" />
                <CoverUploader value={form.cover_url} onChange={(u) => setForm({ ...form, cover_url: u || "" })} folder="partners-cover" label="صورة الغلاف" />
              </div>
              <GalleryUploader value={gallery} onChange={setGallery} folder="partners-gallery" label="معرض صور إضافي (10+ صور)" />
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
