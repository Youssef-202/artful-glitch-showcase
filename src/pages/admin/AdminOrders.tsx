import { useEffect, useState } from "react";
import { ShoppingBag, X, AlertCircle, Loader2, Edit3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls, textareaCls } from "./_shared/uploaders";

export default function AdminOrders() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("service_orders").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const payload: any = {
      service_name_ar: form.service_name_ar, service_name_en: form.service_name_en,
      description: form.description, total_amount: Number(form.total_amount) || 0,
      currency: form.currency || "EGP", current_stage: Number(form.current_stage) || 0,
      status: form.status, estimated_delivery: form.estimated_delivery || null,
      admin_notes: form.admin_notes,
      stage1_name: form.stage1_name, stage2_name: form.stage2_name, stage3_name: form.stage3_name, stage4_name: form.stage4_name,
    };
    const { error } = await (supabase as any).from("service_orders").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الطلب؟")) return;
    const { error } = await (supabase as any).from("service_orders").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-cyan-400" /> الطلبات</h3>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد طلبات.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">الخدمة</th><th className="p-3">المبلغ</th><th className="p-3">المدفوع</th><th className="p-3">المرحلة</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white">{r.service_name_ar || r.service_key}</td>
                    <td className="p-3 text-emerald-400 font-mono">{r.total_amount} {r.currency}</td>
                    <td className="p-3 text-cyan-400 font-mono">{r.paid_amount || 0}</td>
                    <td className="p-3 text-slate-400">{r.current_stage}/4</td>
                    <td className="p-3 text-slate-400">{r.status}</td>
                    <td className="p-3 text-slate-500">{new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm(r); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel max-w-3xl w-full rounded-2xl my-4">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
              <h4 className="font-bold text-base text-white">
                تعديل الطلب
                {(form.service_name_ar || form.service_name_en) && (
                  <span className="text-cyan-400 font-normal mr-2">— {form.service_name_ar || form.service_name_en}</span>
                )}
              </h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="اسم الخدمة (عربي)"><input className={inputCls} value={form.service_name_ar || ""} onChange={(e) => setForm({ ...form, service_name_ar: e.target.value })} /></Field>
                <Field label="Service Name (EN)"><input className={inputCls} value={form.service_name_en || ""} onChange={(e) => setForm({ ...form, service_name_en: e.target.value })} /></Field>
                <Field label="المبلغ الكلي"><input type="number" className={inputCls} value={form.total_amount || ""} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} /></Field>
                <Field label="العملة"><input className={inputCls} value={form.currency || ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
                <Field label="المرحلة الحالية (0-4)"><input type="number" className={inputCls} value={form.current_stage || 0} onChange={(e) => setForm({ ...form, current_stage: e.target.value })} /></Field>
                <Field label="الحالة"><input className={inputCls} value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} /></Field>
                <Field label="تاريخ التسليم المتوقع"><input type="date" className={inputCls} value={form.estimated_delivery || ""} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <Field key={n} label={`اسم المرحلة ${n}`}><input className={inputCls} value={form[`stage${n}_name`] || ""} onChange={(e) => setForm({ ...form, [`stage${n}_name`]: e.target.value })} /></Field>
                ))}
              </div>
              <Field label="الوصف"><textarea className={textareaCls + " h-24"} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              <Field label="ملاحظات الإدارة"><textarea className={textareaCls + " h-20"} value={form.admin_notes || ""} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} /></Field>
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
