import { useEffect, useState } from "react";
import { Server, Plus, Edit3, Trash2, DollarSign, Tag, AlertCircle, X } from "lucide-react";
import { supabaseExternal } from "@/integrations/supabase/external";

interface ServiceItem {
  id?: number | string;
  title: string;
  description: string;
  price: number | null;
  category: string;
  icon?: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState<ServiceItem>({ title: "", description: "", price: null, category: "", icon: "" });

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabaseExternal.from("services").select("*").order("id", { ascending: false });
    if (error) setError(`فشل جلب الخدمات: ${error.message}`);
    else setServices((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: "", description: "", price: null, category: "", icon: "" });
    setOpen(true);
  };
  const openEdit = (s: ServiceItem) => {
    setEditingId(s.id ?? null);
    setForm({ ...s });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: form.price !== null && String(form.price) !== "" ? Number(form.price) : null,
      category: form.category,
      icon: form.icon || null,
    };
    const { error } = editingId
      ? await supabaseExternal.from("services").update(payload).eq("id", editingId)
      : await supabaseExternal.from("services").insert([payload]);
    if (error) {
      setError(`فشل الحفظ: ${error.message}`);
      return;
    }
    setOpen(false);
    fetchServices();
  };

  const remove = async (id: any) => {
    if (!confirm("حذف هذه الخدمة نهائياً؟")) return;
    const { error } = await supabaseExternal.from("services").delete().eq("id", id);
    if (error) setError(`فشل الحذف: ${error.message}`);
    else fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          قائمة الخدمات
        </h3>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          إضافة خدمة
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> <span>{error}</span>
        </div>
      )}

      <div className="cyber-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">لا توجد خدمات بعد. ابدأ بإضافة واحدة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-semibold">
                  <th className="p-4">اسم الخدمة</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4 hidden md:table-cell">الوصف</th>
                  <th className="p-4 text-center w-24">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/20">
                    <td className="p-4 font-bold text-white">{s.title}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                        {s.category || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {s.price ? `$ ${Number(s.price).toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate hidden md:table-cell">{s.description}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(s.id)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="cyber-panel max-w-lg w-full rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-l from-cyan-400 via-transparent to-pink-500" />
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-base text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                {editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
              </h4>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">اسم الخدمة</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">التصنيف</label>
                  <div className="relative">
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-slate-900/60 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 pr-9 pl-3 text-white text-sm focus:outline-none"
                    />
                    <Tag className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">السعر ($)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.price ?? ""}
                      onChange={(e) => setForm({ ...form, price: e.target.value === "" ? null : Number(e.target.value) })}
                      className="w-full bg-slate-900/60 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 pr-9 pl-3 text-white text-sm font-mono focus:outline-none"
                    />
                    <DollarSign className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">الوصف</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-cyan-400 rounded-lg py-2 px-3 text-white text-sm focus:outline-none h-24 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-sm">
                  حفظ
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
