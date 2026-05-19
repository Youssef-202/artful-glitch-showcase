import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Calendar as CalendarIcon, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Order = {
  id: string;
  user_id: string;
  service_name_ar: string;
  service_key: string;
  description: string | null;
  total_amount: number;
  paid_amount: number;
  currency: string;
  current_stage: number;
  status: string;
  stage1_name: string; stage2_name: string; stage3_name: string; stage4_name: string;
  stage1_completed_at: string | null; stage2_completed_at: string | null;
  stage3_completed_at: string | null; stage4_completed_at: string | null;
  estimated_delivery: string | null;
  admin_notes: string | null;
  created_at: string;
};

type Payment = {
  id: string; order_id: string; user_id: string;
  amount: number; currency: string; method: string;
  status: string; reference: string | null; created_at: string;
};

type Meeting = {
  id: string; order_id: string; user_id: string; title: string;
  scheduled_at: string; duration_minutes: number; channel: string;
  location: string | null; notes: string | null; status: string;
};

type Message = {
  id: string; order_id: string; user_id: string; sender: string;
  message: string; created_at: string;
};

type Profile = { id: string; display_name: string | null };

const statusOptions = [
  { v: "pending", l: "في الانتظار" },
  { v: "in_progress", l: "قيد التنفيذ" },
  { v: "review", l: "مراجعة" },
  { v: "completed", l: "مكتمل" },
  { v: "cancelled", l: "ملغي" },
];

const meetingStatusOptions = [
  { v: "scheduled", l: "مجدول" },
  { v: "completed", l: "تم" },
  { v: "cancelled", l: "ملغي" },
  { v: "rescheduled", l: "تم تأجيله" },
];

function MeetingsBlock({ orderId, userId, meetings, refresh }: {
  orderId: string; userId: string; meetings: Meeting[]; refresh: () => void;
}) {
  const list = meetings.filter((m) => m.order_id === orderId);
  const [form, setForm] = useState({
    title: "اجتماع تواصل",
    scheduled_at: "",
    duration_minutes: 30,
    channel: "call",
    location: "",
    notes: "",
    status: "scheduled",
  });
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!form.scheduled_at) { toast.error("اختر التاريخ"); return; }
    setBusy(true);
    const { error } = await supabase.from("order_meetings").insert({
      order_id: orderId, user_id: userId, ...form,
      location: form.location || null, notes: form.notes || null,
      duration_minutes: Number(form.duration_minutes),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تمت الإضافة"); setForm({ ...form, scheduled_at: "", notes: "" }); refresh(); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("order_meetings").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الموعد؟")) return;
    const { error } = await supabase.from("order_meetings").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("✓"); refresh(); }
  };

  return (
    <div className="space-y-3">
      {list.map((m) => (
        <div key={m.id} className="flex items-start justify-between gap-3 bg-background/40 rounded-xl p-3 text-sm">
          <div className="min-w-0">
            <p className="font-bold">{m.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(m.scheduled_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
              {" · "}{m.duration_minutes} د · {m.channel}
              {m.location && ` · ${m.location}`}
            </p>
            {m.notes && <p className="text-xs mt-1 text-foreground/80">{m.notes}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <select value={m.status} onChange={(e) => updateStatus(m.id, e.target.value)}
              className="bg-background/50 border border-border rounded-lg px-2 py-1 text-[11px]">
              {meetingStatusOptions.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <button onClick={() => remove(m.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input placeholder="عنوان الموعد" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <input type="datetime-local" value={form.scheduled_at}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <input type="number" placeholder="مدة (دقيقة)" value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
          className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
          className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm">
          <option value="call">مكالمة</option>
          <option value="whatsapp">واتساب</option>
          <option value="zoom">Zoom</option>
          <option value="meet">Google Meet</option>
          <option value="onsite">حضوري</option>
        </select>
        <input placeholder="مكان/رابط (اختياري)" value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="col-span-2 bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <input placeholder="ملاحظات" value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="col-span-1 bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <button onClick={add} disabled={busy}
          className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 font-bold text-sm bg-accent/20 text-accent hover:bg-accent/30 transition disabled:opacity-50">
          <Plus className="w-4 h-4" /> أضف موعد
        </button>
      </div>
    </div>
  );
}

function MessagesBlock({ orderId, userId, messages, refresh }: {
  orderId: string; userId: string; messages: Message[]; refresh: () => void;
}) {
  const list = messages.filter((m) => m.order_id === orderId);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("order_messages").insert({
      order_id: orderId, user_id: userId, sender: "admin", message: text.trim().slice(0, 2000),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { setText(""); refresh(); }
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("order_messages").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {list.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مراسلات بعد.</p>}
        {list.map((m) => {
          const isAdminMsg = m.sender === "admin";
          return (
            <div key={m.id} className={`flex ${isAdminMsg ? "justify-end" : "justify-start"} group`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm relative ${
                isAdminMsg ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground"
                  : "bg-background/60 border border-border"
              }`}>
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`text-[10px] mt-1 ${isAdminMsg ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {m.sender === "user" ? "العميل" : "الإدارة"} · {new Date(m.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                </p>
                <button onClick={() => del(m.id)}
                  className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full p-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={2000} placeholder="اكتب رسالة للعميل..."
          className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
        <button onClick={send} disabled={busy || !text.trim()}
          className="rounded-xl px-4 py-2 bg-gradient-to-tr from-primary to-accent text-primary-foreground font-bold text-sm hover:scale-105 transition disabled:opacity-50 inline-flex items-center gap-1">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function OrderRow({ order, profile, payments, meetings, messages, onChange }: { order: Order; profile?: Profile; payments: Payment[]; meetings: Meeting[]; messages: Message[]; onChange: () => void }) {
  const [expand, setExpand] = useState(false);
  const [form, setForm] = useState({
    current_stage: order.current_stage,
    status: order.status,
    total_amount: order.total_amount,
    estimated_delivery: order.estimated_delivery ?? "",
    admin_notes: order.admin_notes ?? "",
  });
  const [pay, setPay] = useState({ amount: "", method: "تحويل بنكي", reference: "", status: "completed" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const updates: any = { ...form, estimated_delivery: form.estimated_delivery || null };
    // Auto-mark stage completion
    const stageField = `stage${form.current_stage - 1}_completed_at` as keyof Order;
    if (form.current_stage > order.current_stage && form.current_stage > 1) {
      updates[stageField as string] = new Date().toISOString();
    }
    if (form.status === "completed" && !order.stage4_completed_at) {
      updates.stage4_completed_at = new Date().toISOString();
      updates.current_stage = 4;
    }
    const { error } = await supabase.from("service_orders").update(updates).eq("id", order.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تم الحفظ"); onChange(); }
  };

  const addPayment = async () => {
    const amt = Number(pay.amount);
    if (!amt || amt <= 0) { toast.error("ادخل مبلغ صحيح"); return; }
    setBusy(true);
    const { error } = await supabase.from("payments").insert({
      order_id: order.id,
      user_id: order.user_id,
      amount: amt,
      currency: order.currency,
      method: pay.method.slice(0, 50),
      reference: pay.reference.slice(0, 100) || null,
      status: pay.status,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تم تسجيل الدفعة"); setPay({ amount: "", method: "تحويل بنكي", reference: "", status: "completed" }); onChange(); }
  };

  const delPayment = async (id: string) => {
    if (!confirm("حذف الدفعة؟")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("✓"); onChange(); }
  };

  const delOrder = async () => {
    if (!confirm("حذف الطلب نهائياً؟")) return;
    const { error } = await supabase.from("service_orders").delete().eq("id", order.id);
    if (error) toast.error(error.message); else { toast.success("✓"); onChange(); }
  };

  const orderPayments = payments.filter((p) => p.order_id === order.id);
  const remaining = Math.max(0, Number(form.total_amount) - Number(order.paid_amount));

  return (
    <div className="border border-border/40 rounded-2xl bg-background/30 overflow-hidden">
      <button onClick={() => setExpand((p) => !p)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-foreground/5 text-right">
        <div className="min-w-0 flex-1">
          <p className="font-bold truncate">{order.service_name_ar}</p>
          <p className="text-xs text-muted-foreground">
            {profile?.display_name ?? order.user_id.slice(0, 8)} · المرحلة {order.current_stage}/4 · {new Date(order.created_at).toLocaleDateString("ar-EG")}
          </p>
        </div>
        <div className="text-xs whitespace-nowrap">
          <span className="font-bold text-emerald-400">{Number(order.paid_amount).toLocaleString()}</span>
          <span className="text-muted-foreground"> / {Number(order.total_amount).toLocaleString()} {order.currency}</span>
        </div>
      </button>

      {expand && (
        <div className="p-4 space-y-4 border-t border-border/40">
          {order.description && (
            <div className="text-sm bg-background/40 rounded-xl p-3">
              <p className="text-xs font-bold text-muted-foreground mb-1">طلب العميل:</p>
              <p>{order.description}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground mb-1 block">المرحلة الحالية</span>
              <select value={form.current_stage} onChange={(e) => setForm({ ...form, current_stage: Number(e.target.value) })}
                className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary">
                <option value={1}>1 - {order.stage1_name}</option>
                <option value={2}>2 - {order.stage2_name}</option>
                <option value={3}>3 - {order.stage3_name}</option>
                <option value={4}>4 - {order.stage4_name}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground mb-1 block">الحالة</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary">
                {statusOptions.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground mb-1 block">السعر الإجمالي ({order.currency})</span>
              <input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
                className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground mb-1 block">الموعد المتوقع للتسليم</span>
              <input type="date" value={form.estimated_delivery} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })}
                className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-muted-foreground mb-1 block">ملاحظات للعميل</span>
            <textarea value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
              rows={3} maxLength={1000}
              className="w-full bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary resize-none" />
          </label>

          <div className="flex items-center gap-2">
            <button onClick={save} disabled={busy}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition disabled:opacity-50">
              <Save className="w-4 h-4" /> حفظ التعديلات
            </button>
            <button onClick={delOrder}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-sm border border-destructive/40 text-destructive hover:bg-destructive/10 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Payments */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">المدفوعات (المتبقي: {remaining.toLocaleString()} {order.currency})</p>
            </div>
            {orderPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-background/40 rounded-xl p-2 text-sm">
                <div>
                  <span className="font-bold">{Number(p.amount).toLocaleString()} {p.currency}</span>
                  <span className="text-xs text-muted-foreground ms-2">{p.method}{p.reference && ` · ${p.reference}`}</span>
                  <span className={`ms-2 text-xs px-2 py-0.5 rounded-full ${p.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{p.status}</span>
                </div>
                <button onClick={() => delPayment(p.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input type="number" placeholder="المبلغ" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })}
                className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
              <input placeholder="الطريقة" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}
                className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
              <input placeholder="مرجع (اختياري)" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })}
                className="bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm" />
              <button onClick={addPayment} disabled={busy}
                className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 font-bold text-sm bg-primary/20 text-primary hover:bg-primary/30 transition disabled:opacity-50">
                <Plus className="w-4 h-4" /> أضف دفعة
              </button>
            </div>
          </div>

          {/* Meetings */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <p className="font-bold text-sm flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-accent" /> مواعيد التواصل</p>
            <MeetingsBlock orderId={order.id} userId={order.user_id} meetings={meetings} refresh={onChange} />
          </div>

          {/* Messages */}
          <div className="pt-4 border-t border-border/40 space-y-3">
            <p className="font-bold text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" /> المراسلات</p>
            <MessagesBlock orderId={order.id} userId={order.user_id} messages={messages} refresh={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [filter, setFilter] = useState<string>("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    supabase.from("service_orders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) ?? []));
    supabase.from("payments").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data as any) ?? []));
    supabase.from("order_meetings").select("*").order("scheduled_at", { ascending: true })
      .then(({ data }) => setMeetings((data as any) ?? []));
    supabase.from("order_messages").select("*").order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as any) ?? []));
    supabase.from("profiles").select("id,display_name")
      .then(({ data }) => {
        const map: Record<string, Profile> = {};
        (data ?? []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      });
  }, [tick]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-black"><span className="text-gradient">طلبات الخدمات</span></h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-background/50 border border-border rounded-xl px-4 py-2 outline-none focus:border-primary text-sm">
          <option value="all">كل الطلبات ({orders.length})</option>
          {statusOptions.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((o) => (
          <OrderRow key={o.id} order={o} profile={profiles[o.user_id]} payments={payments}
            meetings={meetings} messages={messages} onChange={() => setTick((t) => t + 1)} />
        ))}
        {filtered.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center text-muted-foreground">لا توجد طلبات</div>
        )}
      </div>
    </div>
  );
}
