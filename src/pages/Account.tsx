import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, CreditCard, LogOut, Check, Clock, ChevronRight, Phone, Building2, MapPin } from "lucide-react";
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
  stage1_name: string;
  stage2_name: string;
  stage3_name: string;
  stage4_name: string;
  stage1_completed_at: string | null;
  stage2_completed_at: string | null;
  stage3_completed_at: string | null;
  stage4_completed_at: string | null;
  estimated_delivery: string | null;
  admin_notes: string | null;
  created_at: string;
};

type Payment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  avatar_url: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  in_progress: "قيد التنفيذ",
  review: "مراجعة",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  review: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/40",
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 relative">
        {stages.map((s) => {
          const active = s.num === order.current_stage;
          const done = s.done || s.num < order.current_stage;
          return (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition ${
                  done
                    ? "bg-gradient-to-tr from-primary to-accent text-primary-foreground border-transparent shadow-glow"
                    : active
                    ? "bg-background border-accent text-accent animate-pulse"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <p className={`text-xs mt-2 ${done || active ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                {s.name}
              </p>
              {s.at && <p className="text-[10px] text-muted-foreground mt-1">{new Date(s.at).toLocaleDateString("ar-EG")}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order, payments }: { order: Order; payments: Payment[] }) {
  const [open, setOpen] = useState(false);
  const orderPayments = payments.filter((p) => p.order_id === order.id);
  const remaining = Math.max(0, Number(order.total_amount) - Number(order.paid_amount));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-6 space-y-5"
    >
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

      {order.estimated_delivery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          الموعد المتوقع للتسليم: {new Date(order.estimated_delivery).toLocaleDateString("ar-EG")}
        </div>
      )}

      {(order.admin_notes || orderPayments.length > 0 || order.description) && (
        <button
          onClick={() => setOpen((p) => !p)}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {open ? "إخفاء التفاصيل" : "عرض كل التفاصيل"} <ChevronRight className={`w-4 h-4 transition ${open ? "rotate-90" : ""}`} />
        </button>
      )}

      {open && (
        <div className="space-y-4 pt-2 border-t border-border/50">
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
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تم حفظ البيانات"); onSave(); }
  };

  return (
    <div className="glass-strong rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-black">بياناتي</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><User className="w-3 h-3" /> الاسم</span>
          <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            maxLength={100}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> رقم الهاتف</span>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            maxLength={30}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Building2 className="w-3 h-3" /> الشركة</span>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
            maxLength={100}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" /> البلد</span>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
            maxLength={60}
            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </label>
      </div>
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
          {orders.map((o) => <OrderCard key={o.id} order={o} payments={payments} />)}
        </div>
      )}

      {tab === "profile" && profile && (
        <ProfileSection profile={profile} onSave={() => setTick((t) => t + 1)} />
      )}
    </div>
  );
}
