import { useEffect, useState } from "react";
import { Edit3, X, AlertCircle, Globe, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls, textareaCls } from "./_shared/uploaders";

export default function AdminPages() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [text, setText] = useState("");
  const [pageKey, setPageKey] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("site_pages").select("*").order("page_key");
    if (error) setErr(error.message); else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchRows(); }, []);

  const open = (r: any | null) => {
    setEditing(r || {});
    setPageKey(r?.page_key || "");
    setText(JSON.stringify(r?.content ?? {}, null, 2));
  };

  const save = async () => {
    setSaving(true); setErr(null);
    let content: any;
    try { content = JSON.parse(text); } catch (e: any) { setErr("JSON غير صالح: " + e.message); setSaving(false); return; }
    const payload = { page_key: pageKey, content };
    const q = editing?.page_key
      ? (supabase as any).from("site_pages").update({ content }).eq("page_key", editing.page_key)
      : (supabase as any).from("site_pages").upsert([payload], { onConflict: "page_key" });
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setEditing(null); fetchRows();
  };

  const remove = async (key: string) => {
    if (!confirm("حذف الصفحة؟")) return;
    const { error } = await (supabase as any).from("site_pages").delete().eq("page_key", key);
    if (error) setErr(error.message); else fetchRows();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-cyan-400" /> صفحات الموقع</h3>
        <button onClick={() => open(null)} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm">صفحة جديدة</button>
      </div>
      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div> :
          rows.length === 0 ? <div className="p-12 text-center text-slate-500 text-sm">لا توجد صفحات.</div> :
            <table className="w-full text-right text-xs md:text-sm">
              <thead><tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400"><th className="p-3">مفتاح الصفحة</th><th className="p-3">آخر تعديل</th><th className="p-3 text-center w-24">إجراءات</th></tr></thead>
              <tbody className="divide-y divide-slate-800/60">
                {rows.map((r) => (
                  <tr key={r.page_key}>
                    <td className="p-3 font-bold text-white font-mono">{r.page_key}</td>
                    <td className="p-3 text-slate-400">{r.updated_at ? new Date(r.updated_at).toLocaleString("ar-EG") : "—"}</td>
                    <td className="p-3"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => open(r)} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => remove(r.page_key)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">×</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="cyber-panel max-w-3xl w-full rounded-2xl my-4">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/90 z-10">
              <h4 className="font-bold text-base text-white">تعديل الصفحة</h4>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="مفتاح الصفحة (page_key)"><input className={inputCls} value={pageKey} onChange={(e) => setPageKey(e.target.value)} disabled={!!editing?.page_key} /></Field>
              <Field label="المحتوى (JSON)" hint="بنية JSON حرة بحسب الصفحة"><textarea className={textareaCls + " h-96 font-mono"} value={text} onChange={(e) => setText(e.target.value)} /></Field>
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button disabled={saving} onClick={save} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ</button>
                <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
