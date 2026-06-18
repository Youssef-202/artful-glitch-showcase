import { useEffect, useState } from "react";
import { Users, X, AlertCircle, Loader2, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoverUploader, Field, inputCls, textareaCls } from "./_shared/uploaders";

export default function AdminUsers() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("profiles").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr(null);
    const payload: any = {
      display_name: form.display_name, phone: form.phone, company: form.company,
      country: form.country, city: form.city, business_type: form.business_type,
      bio: form.bio, website: form.website, avatar_url: form.avatar_url, gender: form.gender,
      date_of_birth: form.date_of_birth || null,
    };
    const { error } = await (supabase as any).from("profiles").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); fetchRows();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> المستخدمون</h3>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا يوجد مستخدمون.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400">
                <th className="p-3">الاسم</th><th className="p-3">الهاتف</th><th className="p-3">الشركة</th><th className="p-3">البلد</th><th className="p-3">تاريخ التسجيل</th><th className="p-3 text-center w-24">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-white flex items-center gap-2">{r.avatar_url && <img src={r.avatar_url} className="w-7 h-7 rounded-full object-cover" />}{r.display_name || "—"}</td>
                    <td className="p-3 text-slate-400">{r.phone || "—"}</td>
                    <td className="p-3 text-slate-400">{r.company || "—"}</td>
                    <td className="p-3 text-slate-400">{r.country || "—"}</td>
                    <td className="p-3 text-slate-500">{new Date(r.created_at).toLocaleDateString("ar-EG")}</td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setForm(r); setOpen(true); }} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
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
              <h4 className="font-bold text-base text-white">تعديل المستخدم</h4>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <CoverUploader value={form.avatar_url} onChange={(u) => setForm({ ...form, avatar_url: u || "" })} folder="avatars" label="الصورة الشخصية" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="الاسم"><input className={inputCls} value={form.display_name || ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></Field>
                <Field label="الهاتف"><input className={inputCls} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label="الشركة"><input className={inputCls} value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
                <Field label="نوع النشاط"><input className={inputCls} value={form.business_type || ""} onChange={(e) => setForm({ ...form, business_type: e.target.value })} /></Field>
                <Field label="البلد"><input className={inputCls} value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
                <Field label="المدينة"><input className={inputCls} value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
                <Field label="الجنس"><select className={inputCls} value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">—</option><option value="male">ذكر</option><option value="female">أنثى</option></select></Field>
                <Field label="تاريخ الميلاد"><input type="date" className={inputCls} value={form.date_of_birth || ""} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
                <Field label="الموقع الإلكتروني"><input className={inputCls} value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
              </div>
              <Field label="نبذة"><textarea className={textareaCls + " h-24"} value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
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
