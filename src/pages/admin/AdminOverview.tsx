import { useEffect, useState } from "react";
import { Wrench, Mail, MailOpen, Clock } from "lucide-react";
import { supabaseExternal } from "@/integrations/supabase/external";

export default function AdminOverview() {
  const [stats, setStats] = useState({ services: 0, messages: 0, unread: 0 });
  const [latest, setLatest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [svc, msgs] = await Promise.all([
          supabaseExternal.from("services").select("id", { count: "exact", head: true }),
          supabaseExternal.from("messages").select("*").order("created_at", { ascending: false }).limit(50),
        ]);
        const all = msgs.data ?? [];
        setStats({
          services: svc.count ?? 0,
          messages: all.length,
          unread: all.filter((m: any) => m.status !== "read").length,
        });
        setLatest(all.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "عدد الخدمات", value: stats.services, icon: Wrench, color: "cyan" },
    { label: "إجمالي الرسائل", value: stats.messages, icon: Mail, color: "pink" },
    { label: "رسائل غير مقروءة", value: stats.unread, icon: MailOpen, color: "purple" },
  ];

  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="cyber-panel p-5 rounded-xl flex justify-between items-start">
              <div>
                <p className="text-[10px] text-slate-400 font-bold">{c.label}</p>
                <h3 className="text-2xl font-black text-white text-glow-cyan mt-1">{loading ? "..." : c.value}</h3>
              </div>
              <div className={`p-2.5 rounded border ${colorMap[c.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="cyber-panel p-6 rounded-xl">
        <h4 className="font-bold text-xs text-white border-b border-slate-800 pb-3 flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          آخر 5 رسائل واردة
        </h4>
        <div className="divide-y divide-slate-800/50">
          {loading ? (
            <div className="py-6 text-center text-slate-500 text-xs">جاري التحميل...</div>
          ) : latest.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">لا توجد رسائل بعد.</div>
          ) : (
            latest.map((m) => (
              <div key={m.id} className="py-3 flex justify-between items-center gap-4 text-xs">
                <div>
                  <span className="font-bold text-white block">{m.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.email}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString("ar-EG") : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
