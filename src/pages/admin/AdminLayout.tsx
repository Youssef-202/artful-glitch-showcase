import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const titles: Record<string, { t: string; s: string }> = {
  "/admin-dashboard": { t: "لوحة التحكم", s: "نظرة عامة على الخدمات والرسائل الواردة" },
  "/admin-dashboard/services": { t: "إدارة الخدمات", s: "إضافة وتعديل وحذف الخدمات المعروضة في الموقع" },
  "/admin-dashboard/messages": { t: "الرسائل الواردة", s: "إدارة رسائل الزوار من نموذج التواصل" },
  "/admin-dashboard/guide": { t: "دليل الداشبورد", s: "مرجع كامل لبنية اللوحة وكل الأقسام والأكشنز" },
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const meta = titles[pathname] ?? titles["/admin-dashboard"];

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 cyber-grid relative" dir="rtl">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      <AdminSidebar />

      <div className="pr-64 min-h-screen flex flex-col z-10 relative">
        <header className="h-16 border-b border-cyan-500/10 px-8 flex items-center justify-between bg-slate-950/20 backdrop-blur-sm">
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full inline-block" />
              {meta.t}
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">{meta.s}</p>
          </div>
          <div className="px-3 py-1 rounded border border-cyan-500/20 bg-cyan-500/5 text-[10px] text-cyan-400 font-mono">
            {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
