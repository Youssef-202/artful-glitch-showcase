import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Image as ImageIcon,
  Globe,
  MessageSquare,
  Handshake,
  ShoppingBag,
  CreditCard,
  Users,
  Mail,
  ExternalLink,
  BookOpen,
  Radio,
  Database,
  ShieldCheck,
  Search,
  Sparkles,
  Info,
} from "lucide-react";

const items = [
  { to: "/admin-dashboard010", label: "نظرة عامة", icon: LayoutDashboard, end: true },
  { to: "/admin-dashboard010/hero", label: "الهيرو سيكشن", icon: Sparkles },
  { to: "/admin-dashboard010/partners", label: "الشركاء", icon: Handshake },
  { to: "/admin-dashboard010/services", label: "الخدمات", icon: Wrench },
  { to: "/admin-dashboard010/portfolio", label: "الأعمال", icon: ImageIcon },
  { to: "/admin-dashboard010/blog", label: "المدونة", icon: FileText },
  { to: "/admin-dashboard010/about", label: "من نحن", icon: Info },
  { to: "/admin-dashboard010/testimonials", label: "آراء العملاء", icon: MessageSquare },
  { to: "/admin-dashboard010/access", label: "صلاحيات الأدمن", icon: ShieldCheck },
  { to: "/admin-dashboard010/seo", label: "السيو ومحركات البحث", icon: Search },
  { to: "/admin-dashboard010/pages", label: "صفحات الموقع", icon: Globe },
  { to: "/admin-dashboard010/orders", label: "الطلبات", icon: ShoppingBag },
  { to: "/admin-dashboard010/payments", label: "المدفوعات", icon: CreditCard },
  { to: "/admin-dashboard010/users", label: "المستخدمون", icon: Users },
  { to: "/admin-dashboard010/messages", label: "الرسائل", icon: Mail },
  { to: "/admin-dashboard010/guide", label: "دليل الداشبورد", icon: BookOpen },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 h-screen fixed right-0 top-0 z-20 flex flex-col border-l border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="p-5 border-b border-cyan-500/20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <span className="text-slate-950 font-black text-lg">إ</span>
        </div>
        <span className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
          إتـقـان · لوحة التحكم
        </span>
      </div>

      <div className="px-5 py-3 border-b border-cyan-500/10 bg-slate-900/30">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" /> الإدارة:
          </span>
          <span className="flex items-center gap-1 text-white font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> متصل
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto admin-sidebar-nav">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-transparent border-r-2 border-cyan-400 text-white"
                    : "text-white hover:text-white hover:bg-slate-900/40"
                }`
              }
            >
              <Icon className="w-4 h-4 text-white" />
              <span className="text-white">{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-cyan-500/10">
        <a
          href="/"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white hover:bg-slate-900/40 transition-all duration-300"
        >
          <ExternalLink className="w-4 h-4" />
          <span>العودة للموقع</span>
        </a>
      </div>
    </aside>
  );
}
