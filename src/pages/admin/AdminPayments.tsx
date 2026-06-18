import { useEffect, useState } from "react";
import { CreditCard, X, AlertCircle, Loader2, Edit3, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls, textareaCls } from "./_shared/uploaders";

const empty: any = { order_id: "", user_id: "", amount: "", currency: "EGP", method: "", status: "pending", reference: "", notes: "" };

export default function AdminPayments() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("payments").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const payload = { ...form, amount: Number(form.amount) || 0 };
    const q = editingId
      ? (supabase as any).from("payments").update(payload).eq("id", editingId)
      : (supabase as any).from("payments").insert([payload]);
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الدفع؟")) return;
    const { error } = await (supabase as any).from("payments").delete().eq("id", id);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-cyan-400" /> المدفوعات</h3>
        <button onClick={() => { setForm(empty); setEditingId(null); setOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> دفعة جديدة</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد مدفوعات.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">رقم الطلب</th><th className="p-3">المبلغ</th><th className="p-3">الطريقة</th><th className="p-3">الحالة</th><th className="p-3">المرجع</th><th className="p-3">التاريخ</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 text-slate-300 font-mono text-[10px]">{r.order_id?.slice(0, 8)}</td>
                    <td className="p-3 text-emerald-400 font-mono">{r.amount} {r.currency}</td>
                    <td className="p-3 text-slate-400">{r.method || "—"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${r.status === "completed" ? "bg-emerald-500/15 text-emerald-300" : r.status === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-slate-700/40 text-slate-400"}`}>{r.status}</span></td>
                    <td className="p-3 text-slate-400">{r.reference || "—"}</td>
                    <td className="p-3 text-slate-500">{new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm(r); setEditingId(r.id); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
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
              <h4 className="font-bold text-base text-white">{editingId ? "تعديل دفعة" : "دفعة جديدة"}</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <Field label="معرف الطلب (UUID)"><input className={inputCls} value={form.order_id || ""} onChange={(e) => setForm({ ...form, order_id: e.target.value })} /></Field>
              <Field label="معرف المستخدم (UUID)"><input className={inputCls} value={form.user_id || ""} onChange={(e) => setForm({ ...form, user_id: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="المبلغ *"><input required type="number" step="0.01" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
                <Field label="العملة"><input className={inputCls} value={form.currency || ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></Field>
                <Field label="طريقة الدفع"><input className={inputCls} value={form.method || ""} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="cash / bank / instapay / visa..." /></Field>
                <Field label="الحالة"><select className={inputCls} value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="pending">قيد الانتظار</option><option value="completed">مكتمل</option><option value="failed">فاشل</option><option value="refunded">مسترد</option></select></Field>
              </div>
              <Field label="مرجع المعاملة"><input className={inputCls} value={form.reference || ""} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
              <Field label="ملاحظات"><textarea className={textareaCls + " h-20"} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
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
