import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  CreditCard,
  LogOut,
  Check,
  Clock,
  ChevronRight,
  Phone,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  MessageSquare,
  Send,
  Cake,
  Heart,
  Globe,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";

type Order = {
  id: string;
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
  id: string; order_id: string; amount: number; currency: string; method: string;
  status: string; reference: string | null; created_at: string;
};

type Meeting = {
  id: string; order_id: string; title: string; scheduled_at: string;
  duration_minutes: number; channel: string; location: string | null;
  notes: string | null; status: string;
};

type Message = {
  id: string; order_id: string; sender: string; message: string; created_at: string;
};

type Profile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  business_type: string | null;
  interests: string[] | null;
  bio: string | null;
  website: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "في الانتظار", in_progress: "قيد التنفيذ",
  review: "مراجعة", completed: "مكتمل", cancelled: "ملغي",
};
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  review: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/40",
};
const meetingStatusLabels: Record<string, string> = {
  scheduled: "مجدول", completed: "تم", cancelled: "ملغي", rescheduled: "تم تأجيله",
};

function StageTracker({ order }: { order: Order }) {
  const stages = [
    { num: 1, name: order.stage1_name, done: !!order.stage1_completed_at, at: order.stage1_completed_at },
    { num: 2, name: order.stage2_name, done: !!order.stage2_completed_at, at: order.stage2_completed_at },
    { num: 3, name: order.stage3_name, done: !!order.stage3_completed_at, at: order.stage3_completed_at },
    { num: 4, name: order.stage4_name, done: !!order.stage4_completed_at, at: order.stage4_completed_at },
  ];
  const progressPct = ((order.current_stage - 1) / 3) * 100;
  return (
    <div className="relative pt-2">
      <div className="absolute top-7 left-4 right-4 h-1 bg-foreground/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-accent" />
      </div>
      <div className="grid grid-cols-4 gap-2 relative">
        {stages.map((s) => {
          const active = s.num === order.current_stage;
          const done = s.done || s.num < order.current_stage;
          return (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition ${
                done ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground border-transparent shadow-glow"
                  : active ? "bg-background border-accent text-accent animate-pulse"
                  : "bg-background border-border text-muted-foreground"
              }`}>
                {done ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <p className={`text-xs mt-2 ${done || active ? "text-foreground font-bold" : "text-muted-foreground"}`}>{s.name}</p>
              {s.at && <p className="text-[10px] text-muted-foreground mt-1">{new Date(s.at).toLocaleDateString("ar-EG")}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeetingsSection({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0)
    return <p className="text-sm text-muted-foreground">لا توجد مواعيد محددة بعد. الفريق هيحدد لك مواعيد التواصل قريباً.</p>;
  return (
    <div className="space-y-2">
      {meetings.map((m) => {
        const d = new Date(m.scheduled_at);
        const isPast = d.getTime() < Date.now();
        return (
          <div key={m.id} className={`rounded-xl border p-3 ${isPast ? "border-border bg-background/30" : "border-accent/40 bg-accent/5"}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-sm">{m.title}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                  <CalendarIcon className="w-3 h-3" />
                  {d.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                  <span>· {m.duration_minutes} دقيقة</span>
                  <span>· {m.channel}</span>
                  {m.location && <span>· {m.location}</span>}
                </p>
                {m.notes && <p className="text-xs mt-2 text-foreground/80">{m.notes}</p>}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 border border-border">
                {meetingStatusLabels[m.status] ?? m.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessagesSection({ orderId, userId, messages, refresh }: {
  orderId: string; userId: string; messages: Message[]; refresh: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("order_messages").insert({
      order_id: orderId, user_id: userId, sender: "user", message: text.trim().slice(0, 2000),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { setText(""); refresh(); }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">ابدأ الحوار مع فريقنا.</p>}
        {messages.map((m) => {
          const mine = m.sender === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                mine ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground"
                     : "bg-background/60 border border-border"
              }`}>
                <p className="whitespace-pre-wrap">{m.message}</p>
                <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={2000}
          placeholder="اكتب رسالتك..."
          className="flex-1 bg-background/50 border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm"
        />
        <button onClick={send} disabled={busy || !text.trim()}
          className="rounded-xl px-4 py-2 bg-gradient-to-tr from-primary to-accent text-primary-foreground font-bold text-sm hover:scale-105 transition disabled:opacity-50 inline-flex items-center gap-1">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function OrderCard({ order, payments, meetings, messages, userId, refresh }: {
  order: Order; payments: Payment[]; meetings: Meeting[]; messages: Message[]; userId: string; refresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const orderPayments = payments.filter((p) => p.order_id === order.id);
  const orderMeetings = meetings.filter((m) => m.order_id === order.id);
  const orderMessages = messages.filter((m) => m.order_id === order.id);
  const upcoming = orderMeetings.filter((m) => new Date(m.scheduled_at).getTime() > Date.now() && m.status === "scheduled").length;
  const remaining = Math.max(0, Number(order.total_amount) - Number(order.paid_amount));

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1">رقم الطلب: {order.id.slice(0, 8)}</p>
          <h3 className="text-xl font-black">{order.service_name_ar}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG")}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] ?? ""}`}>
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <StageTracker order={order} />

      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="rounded-xl bg-background/40 border border-border p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">الإجمالي</p>
          <p className="font-black text-sm">{Number(order.total_amount).toLocaleString()} {order.currency}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center">
          <p className="text-[10px] text-emerald-400 mb-1">المدفوع</p>
          <p className="font-black text-sm text-emerald-400">{Number(order.paid_amount).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-center">
          <p className="text-[10px] text-amber-400 mb-1">المتبقي</p>
          <p className="font-black text-sm text-amber-400">{remaining.toLocaleString()}</p>
        </div>
      </div>

      {(order.estimated_delivery || upcoming > 0) && (
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          {order.estimated_delivery && (
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4" /> التسليم: {new Date(order.estimated_delivery).toLocaleDateString("ar-EG")}
            </span>
          )}
          {upcoming > 0 && (
            <span className="inline-flex items-center gap-2 text-accent font-bold">
              <CalendarIcon className="w-4 h-4" /> {upcoming} موعد قادم
            </span>
          )}
        </div>
      )}

      <button onClick={() => setOpen((p) => !p)}
        className="text-sm text-primary hover:underline flex items-center gap-1">
        {open ? "إخفاء التفاصيل" : "عرض كل التفاصيل والمواعيد والمراسلات"}
        <ChevronRight className={`w-4 h-4 transition ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 pt-2 border-t border-border/50">
          {order.description && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">تفاصيل الطلب</p>
              <p className="text-sm">{order.description}</p>
            </div>
          )}
          {order.admin_notes && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">ملاحظات الفريق</p>
              <p className="text-sm whitespace-pre-wrap">{order.admin_notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-accent" /> مواعيد التواصل والاجتماعات
            </p>
            <MeetingsSection meetings={orderMeetings} />
          </div>

          <div>
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" /> المراسلات
            </p>
            <MessagesSection orderId={order.id} userId={userId} messages={orderMessages} refresh={refresh} />
          </div>

          {orderPayments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">سجل المدفوعات</p>
              <div className="space-y-2">
                {orderPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-background/40 border border-border p-3 text-sm">
                    <div>
                      <p className="font-bold">{Number(p.amount).toLocaleString()} {p.currency}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("ar-EG")} · {p.method}
                        {p.reference && ` · ${p.reference}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {p.status === "completed" ? "تم" : p.status === "pending" ? "معلق" : p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ProfileSection({ profile, onSave }: { profile: Profile; onSave: () => void }) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    phone: profile.phone ?? "",
    company: profile.company ?? "",
    country: profile.country ?? "",
    city: profile.city ?? "",
    date_of_birth: profile.date_of_birth ?? "",
    gender: profile.gender ?? "",
    business_type: profile.business_type ?? "",
    interests: (profile.interests ?? []).join(", "),
    bio: profile.bio ?? "",
    website: profile.website ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);

  const save = async () => {
    setBusy(true);
    const payload = {
      ...form,
      date_of_birth: form.date_of_birth || null,
      interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تم حفظ البيانات"); onSave(); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("الحد الأقصى 5 ميجا"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
    setUploading(false);
    if (updErr) { toast.error(updErr.message); return; }
    setAvatarUrl(url);
    toast.success("تم تحديث صورة البروفايل");
    onSave();
  };

  const field = (label: string, icon: any, input: React.ReactNode) => {
    const Icon = icon;
    return (
      <label className="block">
        <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Icon className="w-3 h-3" /> {label}
        </span>
        {input}
      </label>
    );
  };
  const inp = "w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary";

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-4 mb-2 flex-wrap">
        <label className="relative cursor-pointer group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <User className="w-8 h-8 text-primary-foreground" />}
          </div>
          <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
            {uploading ? "جاري الرفع..." : "تغيير"}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
        </label>
        <div>
          <h2 className="text-xl font-black">بياناتي</h2>
          <p className="text-xs text-muted-foreground mt-1">كل ما زادت بياناتك، كل ما قدرنا نخدمك أفضل</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {field("الاسم", User, <input value={form.display_name} maxLength={100}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })} className={inp} />)}
        {field("رقم الهاتف", Phone, <input value={form.phone} maxLength={30}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />)}
        {field("تاريخ الميلاد", Cake, <input type="date" value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className={inp} />)}
        {field("النوع", User, (
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inp}>
            <option value="">— اختر —</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
            <option value="other">آخر</option>
          </select>
        ))}
        {field("المدينة", MapPin, <input value={form.city} maxLength={60}
          onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />)}
        {field("البلد", Globe, <input value={form.country} maxLength={60}
          onChange={(e) => setForm({ ...form, country: e.target.value })} className={inp} />)}
        {field("الشركة", Building2, <input value={form.company} maxLength={100}
          onChange={(e) => setForm({ ...form, company: e.target.value })} className={inp} />)}
        {field("نوع النشاط", Briefcase, <input value={form.business_type} maxLength={100}
          placeholder="مثال: مطعم، مدرسة، متجر إلكتروني..."
          onChange={(e) => setForm({ ...form, business_type: e.target.value })} className={inp} />)}
        {field("الموقع الإلكتروني", Globe, <input type="url" value={form.website} maxLength={200}
          onChange={(e) => setForm({ ...form, website: e.target.value })} className={inp} />)}
        {field("الاهتمامات (افصلهم بفاصلة)", Heart, <input value={form.interests} maxLength={300}
          placeholder="تسويق, تصميم, تصوير..."
          onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inp} />)}
      </div>

      <label className="block">
        <span className="text-xs text-muted-foreground mb-1 block">نبذة عنك / عن نشاطك</span>
        <textarea rows={3} maxLength={1000} value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className={`${inp} resize-none`} />
      </label>

      <button onClick={save} disabled={busy}
        className="rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-[1.02] transition disabled:opacity-50">
        حفظ البيانات
      </button>
    </div>
  );
}

export default function Account() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tab, setTab] = useState<"orders" | "profile">("orders");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as any));
    supabase.from("service_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) ?? []));
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setPayments((data as any) ?? []));
    supabase.from("order_meetings").select("*").eq("user_id", user.id).order("scheduled_at", { ascending: true })
      .then(({ data }) => setMeetings((data as any) ?? []));
    supabase.from("order_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as any) ?? []));
  }, [user, tick]);

  if (loading) return <div className="px-6 h-96 animate-pulse" />;
  if (!user) return <Navigate to="/auth" replace />;

  const totalSpent = payments.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2"><span className="text-gradient">حسابي</span></h1>
        <p className="text-muted-foreground">{profile?.display_name ?? user.email}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 text-center">
          <Package className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-black">{orders.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-black">{activeOrders}</p>
          <p className="text-xs text-muted-foreground">طلبات نشطة</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
          <p className="text-2xl font-black">{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">إجمالي المدفوع</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab("orders")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition ${tab === "orders" ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow" : "glass hover:bg-foreground/5"}`}>
          طلباتي
        </button>
        <button onClick={() => setTab("profile")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition ${tab === "profile" ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow" : "glass hover:bg-foreground/5"}`}>
          بياناتي
        </button>
        {isAdmin && (
          <Link to="/dashboard" className="px-5 py-2.5 rounded-full font-bold text-sm glass hover:bg-foreground/5">
            لوحة التحكم
          </Link>
        )}
        <button onClick={() => signOut()}
          className="ms-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border border-destructive/40 text-destructive hover:bg-destructive/10 transition">
          <LogOut className="w-4 h-4" /> تسجيل خروج
        </button>
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="glass-strong rounded-3xl p-10 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">ما عندكش طلبات حتى الآن</p>
              <Link to="/services" className="inline-block rounded-full px-6 py-3 font-bold bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-glow hover:scale-105 transition">
                تصفح الخدمات
              </Link>
            </div>
          )}
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} payments={payments} meetings={meetings}
              messages={messages} userId={user.id} refresh={() => setTick((t) => t + 1)} />
          ))}
        </div>
      )}

      {tab === "profile" && profile && (
        <ProfileSection profile={profile} onSave={() => setTick((t) => t + 1)} />
      )}
    </div>
  );
}
