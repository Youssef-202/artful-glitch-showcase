import { useEffect, useState } from "react";
import { Mail, MailOpen, MailCheck, Trash2, Clock, User, Phone, AlertCircle, ChevronLeft } from "lucide-react";
import { supabaseExternal } from "@/integrations/supabase/external";

interface MessageItem {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status?: "read" | "unread" | null;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MessageItem | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabaseExternal.from("messages").select("*").order("created_at", { ascending: false });
    if (error) setError(`فشل جلب الرسائل: ${error.message}`);
    else setMessages((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const setStatus = async (m: MessageItem, status: "read" | "unread") => {
    const { error } = await supabaseExternal.from("messages").update({ status }).eq("id", m.id);
    if (error) return setError(error.message);
    setMessages((cur) => cur.map((x) => (x.id === m.id ? { ...x, status } : x)));
    if (selected?.id === m.id) setSelected({ ...selected, status });
  };

  const remove = async (id: any) => {
    if (!confirm("حذف الرسالة نهائياً؟")) return;
    const { error } = await supabaseExternal.from("messages").delete().eq("id", id);
    if (error) return setError(error.message);
    setMessages((cur) => cur.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const open = (m: MessageItem) => {
    setSelected(m);
    if (m.status !== "read") setStatus(m, "read");
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="space-y-4 lg:col-span-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-pink-400" />
          صندوق الرسائل الواردة
        </h3>

        {error && (
          <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="cyber-panel p-12 text-center text-slate-500 text-sm rounded-xl">جاري التحميل...</div>
          ) : messages.length === 0 ? (
            <div className="cyber-panel p-12 text-center text-slate-500 text-sm rounded-xl">لا توجد رسائل واردة.</div>
          ) : (
            messages.map((m) => {
              const unread = m.status !== "read";
              return (
                <div
                  key={m.id}
                  onClick={() => open(m)}
                  className={`cyber-panel p-5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden group ${
                    selected?.id === m.id
                      ? "border-pink-500 bg-pink-500/5"
                      : unread
                      ? "border-purple-500/25 bg-purple-500/5 hover:border-purple-500/50"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {unread && <div className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500" />}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" /> {m.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-400">
                        {m.email}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-1 leading-5">{m.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-1">
                      <Clock className="w-3.5 h-3.5" /> <span>{fmt(m.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatus(m, unread ? "read" : "unread");
                      }}
                      className={`p-2 rounded border text-xs ${
                        !unread
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {!unread ? <MailOpen className="w-4 h-4" /> : <MailCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(m.id);
                      }}
                      className="p-2 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronLeft className="w-4 h-4 text-slate-500 hidden md:block" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <ChevronLeft className="w-5 h-5 text-cyan-400" />
          تفاصيل الرسالة
        </h3>

        {selected ? (
          <div className="cyber-panel p-6 rounded-xl border border-pink-500/30 relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-pink-500" />
            <div className="space-y-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold">
                  {selected.name?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{selected.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{fmt(selected.created_at)}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" /> <span className="font-mono">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" /> <span className="font-mono">{selected.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider block mb-2 uppercase">المحتوى:</span>
              <p className="text-slate-300 text-xs md:text-sm leading-6 whitespace-pre-line bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                {selected.message}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => remove(selected.id)}
                className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> حذف نهائي
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-lg">
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <div className="cyber-panel p-12 text-center text-slate-500 text-xs rounded-xl border border-dashed border-slate-800">
            اختر رسالة من القائمة لعرض تفاصيلها هنا.
          </div>
        )}
      </div>
    </div>
  );
}
