import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

const empty: any = { name: "", role: "", quote: "", avatar_url: "", sort_order: 0, published: true };

export default function AdminTestimonials() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("testimonials").select("*").order("sort_order");
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    const q = editingId
      ? (supabase as any).from("testimonials").update(payload).eq("id", editingId)
      : (supabase as any).from("testimonials").insert([payload]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الرأي؟")) return;
    const { error } = await (supabase as any).from("testimonials").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-cyan-400" /> آراء العملاء</h3>
        <button onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> رأي جديد</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد آراء.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400"><th className="p-3">الاسم</th><th className="p-3">الدور</th><th className="p-3">منشور</th><th className="p-3 text-center w-24">إجراءات</th></tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white">{r.name}</td>
                    <td className="p-3 text-slate-400">{r.role || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${r.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/40 text-slate-400"}`}>{r.published ? "نعم" : "لا"}</span></td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm({ ...empty, ...r }); setEditingId(r.id); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
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
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل" : "رأي جديد"}</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="الاسم *"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field label="الدور / الوظيفة"><input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
              </div>
              <Field label="الرأي / الاقتباس *"><textarea required className={textareaCls + " h-28"} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></Field>
              <CoverUploader value={form.avatar_url} onChange={(u) => setForm({ ...form, avatar_url: u || "" })} folder="testimonials" label="صورة العميل" />
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
