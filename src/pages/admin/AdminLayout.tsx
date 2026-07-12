import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { supabaseExternal } from "@/integrations/supabase/external";
import { checkCurrentUserIsAdmin } from "./AdminLogin";
import { Loader2 } from "lucide-react";

const titles: Record<string, { t: string; s: string }> = {
  "/admin-dashboard010": { t: "لوحة التحكم", s: "نظرة عامة على المحتوى والطلبات" },
  "/admin-dashboard010/services": { t: "إدارة الخدمات", s: "أضف وعدّل خدمات الموقع بكامل التفاصيل والصور" },
  "/admin-dashboard010/blog": { t: "المدونة", s: "إدارة مقالات المدونة بمحتوى ثنائي اللغة ومعرض صور" },
  "/admin-dashboard010/portfolio": { t: "الأعمال", s: "إدارة معرض الأعمال والمشاريع بكافة التفاصيل" },
  "/admin-dashboard010/pages": { t: "صفحات الموقع", s: "تعديل محتوى الصفحات الثابتة عبر JSON" },
  "/admin-dashboard010/testimonials": { t: "آراء العملاء", s: "إدارة شهادات وآراء العملاء" },
  "/admin-dashboard010/partners": { t: "الشركاء", s: "إدارة شعارات وبيانات الشركاء" },
  "/admin-dashboard010/orders": { t: "الطلبات", s: "متابعة طلبات الخدمات ومراحلها" },
  "/admin-dashboard010/payments": { t: "المدفوعات", s: "تسجيل ومتابعة عمليات الدفع" },
  "/admin-dashboard010/users": { t: "المستخدمون", s: "إدارة حسابات وملفات المستخدمين" },
  "/admin-dashboard010/messages": { t: "الرسائل الواردة", s: "رسائل الزوار من نموذج التواصل" },
  "/admin-dashboard010/access": { t: "صلاحيات الأدمن", s: "إدارة الحسابات التي تستطيع الدخول للوحة التحكم" },
  "/admin-dashboard010/seo": { t: "السيو ومحركات البحث", s: "تحكم كامل في ظهور الموقع على Google وباقي المنصات" },
  "/admin-dashboard010/hero": { t: "واجهة الهيرو", s: "التحكم في نصوص وصورة الخلفية للهيرو في الصفحة الرئيسية" },
  "/admin-dashboard010/guide": { t: "دليل الداشبورد", s: "مرجع كامل لبنية اللوحة وكل الأقسام" },
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = titles[pathname] ?? titles["/admin-dashboard010"];
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const { data } = await supabaseExternal.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate("/admin-login", { replace: true });
        return;
      }
      const ok = await checkCurrentUserIsAdmin();
      if (!mounted) return;
      if (!ok) {
        await supabaseExternal.auth.signOut();
        navigate("/admin-login", { replace: true });
      } else {
        setChecking(false);
      }
    };
    verify();
    document.body.classList.add("admin-body");
    const { data: sub } = supabaseExternal.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin-login", { replace: true });
    });
    return () => {
      mounted = false;
      document.body.classList.remove("admin-body");
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-cyan-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 cyber-grid relative" dir="rtl">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      <AdminSidebar />

      <div className="pr-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-cyan-500/10 px-8 flex items-center justify-between bg-slate-950/20 backdrop-blur-sm">
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full inline-block" />
              {meta.t}
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">{meta.s}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await supabaseExternal.auth.signOut();
                navigate("/admin-login", { replace: true });
              }}
              className="px-3 py-1.5 rounded border border-pink-500/30 bg-pink-500/10 text-[11px] text-pink-300 hover:bg-pink-500/20 transition"
            >
              تسجيل الخروج
            </button>
            <div className="px-3 py-1 rounded border border-cyan-500/20 bg-cyan-500/5 text-[10px] text-cyan-400 font-mono">
              {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
