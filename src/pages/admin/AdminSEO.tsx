import { useEffect, useState } from "react";
import {
  Search, Save, Loader2, AlertCircle, Plus, Trash2,
  Globe, FileText, Bot, Share2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PageSEO = {
  path: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
};

type SEOData = {
  site_name: string;
  default_title: string;
  default_description: string;
  default_keywords: string;
  default_og_image: string;
  twitter_handle: string;
  google_site_verification: string;
  robots_txt: string;
  sitemap_extra: string;
  pages: PageSEO[];
};

const emptyPage: PageSEO = { path: "/", title: "", description: "", keywords: "", og_image: "" };

const defaultData: SEOData = {
  site_name: "إتقان — Etqan Agency",
  default_title: "إتقان | وكالة إبداعية للتصميم والهوية البصرية",
  default_description:
    "وكالة إتقان — نصمم هويات بصرية وتجارب رقمية متقنة تعبّر عن قصتك وتصنع أثراً حقيقياً.",
  default_keywords: "وكالة إبداعية, هوية بصرية, تصميم, إتقان, Etqan",
  default_og_image: "",
  twitter_handle: "",
  google_site_verification: "",
  robots_txt: "User-agent: *\nAllow: /\n",
  sitemap_extra: "",
  pages: [
    { path: "/", title: "", description: "", keywords: "", og_image: "" },
    { path: "/services", title: "", description: "", keywords: "", og_image: "" },
    { path: "/portfolio", title: "", description: "", keywords: "", og_image: "" },
    { path: "/blog", title: "", description: "", keywords: "", og_image: "" },
    { path: "/about", title: "", description: "", keywords: "", og_image: "" },
    { path: "/contact", title: "", description: "", keywords: "", og_image: "" },
  ],
};

/* ---------- Glassmorphic primitives (neon-green) ---------- */

const glass =
  "backdrop-blur-xl bg-white/[0.03] border border-white/10 " +
  "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]";

const inputCls =
  "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 " +
  "bg-white/[0.04] border border-white/10 backdrop-blur-xl " +
  "focus:outline-none focus:border-[#39ff88]/60 focus:bg-white/[0.06] " +
  "focus:shadow-[0_0_0_3px_rgba(57,255,136,0.12),0_0_24px_-4px_rgba(57,255,136,0.35)] " +
  "transition";

const textareaCls = inputCls + " resize-none leading-relaxed";

function GlassField({
  label, hint, counter, children,
}: {
  label: string;
  hint?: string;
  counter?: { value: number; max: number };
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-semibold text-white/80 tracking-wide">{label}</label>
        {counter && (
          <span
            className={`text-[10px] font-mono tabular-nums ${
              counter.value > counter.max ? "text-rose-400" : "text-white/40"
            }`}
          >
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

/* --------------------- Component --------------------- */

export default function AdminSEO() {
  const [data, setData] = useState<SEOData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [tab, setTab] = useState<"general" | "pages" | "social" | "robots">("general");

  useEffect(() => {
    (async () => {
      const { data: row } = await (supabase as any)
        .from("site_pages")
        .select("content")
        .eq("page_key", "seo")
        .maybeSingle();
      if (row?.content)
        setData({ ...defaultData, ...row.content, pages: row.content.pages ?? defaultData.pages });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true); setErr(null); setOk(null);
    const { error } = await (supabase as any)
      .from("site_pages")
      .upsert([{ page_key: "seo", content: data }], { onConflict: "page_key" });
    setSaving(false);
    if (error) setErr(error.message);
    else { setOk("تم حفظ إعدادات السيو بنجاح"); setTimeout(() => setOk(null), 3000); }
  };

  const updatePage = (i: number, patch: Partial<PageSEO>) => {
    const pages = [...data.pages];
    pages[i] = { ...pages[i], ...patch };
    setData({ ...data, pages });
  };
  const addPage = () => setData({ ...data, pages: [...data.pages, { ...emptyPage }] });
  const removePage = (i: number) =>
    setData({ ...data, pages: data.pages.filter((_, x) => x !== i) });

  if (loading)
    return (
      <div className="p-12 text-center text-white/50 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#39ff88]" /> جاري التحميل...
      </div>
    );

  const tabs = [
    { id: "general", label: "الإعدادات العامة", icon: Globe },
    { id: "pages", label: "سيو الصفحات", icon: FileText },
    { id: "social", label: "المشاركة الاجتماعية", icon: Share2 },
    { id: "robots", label: "الزواحف والفهرسة", icon: Bot },
  ] as const;

  return (
    <div dir="rtl" className="space-y-6 relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-[#39ff88]/[0.06] blur-[120px]" />

      {/* Header */}
      <div className={`${glass} rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4 relative`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#39ff88]/25 to-[#39ff88]/5 border border-[#39ff88]/30 flex items-center justify-center shadow-[0_0_20px_-4px_rgba(57,255,136,0.5)]">
            <Search className="w-5 h-5 text-[#39ff88]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              السيو ومحركات البحث
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              تحكّم كامل في ظهور الموقع على Google وباقي محركات البحث
            </p>
          </div>
        </div>

        <button
          disabled={saving}
          onClick={save}
          className="group relative px-5 py-2.5 rounded-xl text-[13px] font-bold text-black
                     bg-gradient-to-b from-[#4dff9b] to-[#26e578]
                     border border-[#39ff88]/70
                     shadow-[0_10px_30px_-8px_rgba(57,255,136,0.6),inset_0_1px_0_rgba(255,255,255,0.4)]
                     hover:shadow-[0_14px_36px_-6px_rgba(57,255,136,0.75)]
                     transition disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>

      {err && (
        <div className={`${glass} rounded-xl p-3 border-rose-500/30 !bg-rose-500/[0.06] text-rose-300 text-xs flex items-center gap-2`}>
          <AlertCircle className="w-4 h-4" /> {err}
        </div>
      )}
      {ok && (
        <div className={`${glass} rounded-xl p-3 !border-[#39ff88]/30 !bg-[#39ff88]/[0.06] text-[#a6ffcd] text-xs`}>
          ✓ {ok}
        </div>
      )}

      {/* Tabs */}
      <div className={`${glass} rounded-2xl p-1.5 flex flex-wrap gap-1 relative`}>
        {tabs.map((tb) => {
          const Ic = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`relative flex-1 min-w-[150px] px-4 py-2.5 rounded-xl text-[12px] font-bold
                          flex items-center justify-center gap-2 transition-all duration-300
                          ${active
                            ? "text-black bg-gradient-to-b from-[#4dff9b] to-[#26e578] shadow-[0_8px_24px_-6px_rgba(57,255,136,0.55),inset_0_1px_0_rgba(255,255,255,0.4)]"
                            : "text-white/60 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Ic className="w-4 h-4" /> {tb.label}
            </button>
          );
        })}
      </div>

      {/* --- TAB: GENERAL --- */}
      {tab === "general" && (
        <div className={`${glass} rounded-2xl p-6 space-y-5 relative`}>
          <GlassField label="اسم الموقع" hint="يظهر بجانب عنوان كل صفحة">
            <input className={inputCls} value={data.site_name}
              onChange={(e) => setData({ ...data, site_name: e.target.value })} />
          </GlassField>

          <GlassField
            label="العنوان الافتراضي (Meta Title)"
            hint="60 حرف كحد أقصى — يظهر في نتائج البحث"
            counter={{ value: data.default_title.length, max: 60 }}
          >
            <input className={inputCls} maxLength={70} value={data.default_title}
              onChange={(e) => setData({ ...data, default_title: e.target.value })} />
          </GlassField>

          <GlassField
            label="الوصف الافتراضي (Meta Description)"
            hint="160 حرف كحد أقصى — الوصف الذي يظهر تحت العنوان في Google"
            counter={{ value: data.default_description.length, max: 160 }}
          >
            <textarea className={textareaCls + " h-28"} maxLength={180}
              value={data.default_description}
              onChange={(e) => setData({ ...data, default_description: e.target.value })} />
          </GlassField>

          <GlassField label="الكلمات المفتاحية (Keywords)" hint="افصل بينها بفاصلة">
            <input className={inputCls} value={data.default_keywords}
              onChange={(e) => setData({ ...data, default_keywords: e.target.value })} />
          </GlassField>

          <GlassField label="Google Site Verification" hint="كود التحقق من Google Search Console">
            <input className={inputCls} placeholder="xyz123..."
              value={data.google_site_verification}
              onChange={(e) => setData({ ...data, google_site_verification: e.target.value })} />
          </GlassField>
        </div>
      )}

      {/* --- TAB: PAGES --- */}
      {tab === "pages" && (
        <div className="space-y-4">
          <div className={`${glass} rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3`}>
            <p className="text-[11px] text-white/60 leading-relaxed max-w-xl">
              اضبط عنوان ووصف كل صفحة على حدة. اترك الحقول فارغة لاستخدام القيم الافتراضية.
            </p>
            <button
              onClick={addPage}
              className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#a6ffcd]
                         bg-[#39ff88]/[0.08] border border-[#39ff88]/30
                         hover:bg-[#39ff88]/[0.14] hover:shadow-[0_0_20px_-4px_rgba(57,255,136,0.4)]
                         transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> صفحة جديدة
            </button>
          </div>

          {data.pages.map((p, i) => (
            <div key={i} className={`${glass} rounded-2xl p-5 space-y-4 relative group`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-[#39ff88]/10 border border-[#39ff88]/30 text-[#39ff88] font-mono text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <input
                    placeholder="/path"
                    className={inputCls + " max-w-xs font-mono text-xs"}
                    value={p.path}
                    onChange={(e) => updatePage(i, { path: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => removePage(i)}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-rose-300 hover:bg-rose-500/[0.08] hover:border-rose-500/30 transition"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassField label="عنوان الصفحة" counter={{ value: p.title.length, max: 60 }}>
                  <input className={inputCls} maxLength={70} value={p.title}
                    onChange={(e) => updatePage(i, { title: e.target.value })} />
                </GlassField>
                <GlassField label="الكلمات المفتاحية">
                  <input className={inputCls} value={p.keywords}
                    onChange={(e) => updatePage(i, { keywords: e.target.value })} />
                </GlassField>
              </div>

              <GlassField label="وصف الصفحة" counter={{ value: p.description.length, max: 160 }}>
                <textarea className={textareaCls + " h-20"} maxLength={180}
                  value={p.description}
                  onChange={(e) => updatePage(i, { description: e.target.value })} />
              </GlassField>

              <GlassField label="صورة المشاركة (OG Image URL)">
                <input className={inputCls} placeholder="https://..." value={p.og_image}
                  onChange={(e) => updatePage(i, { og_image: e.target.value })} />
              </GlassField>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB: SOCIAL --- */}
      {tab === "social" && (
        <div className={`${glass} rounded-2xl p-6 space-y-5`}>
          <GlassField
            label="صورة المشاركة الافتراضية (OG Image)"
            hint="1200×630 بكسل مثالية — تظهر عند مشاركة الموقع على منصات التواصل"
          >
            <input className={inputCls} placeholder="https://..." value={data.default_og_image}
              onChange={(e) => setData({ ...data, default_og_image: e.target.value })} />
          </GlassField>

          {data.default_og_image && (
            <div className={`${glass} rounded-xl overflow-hidden p-1.5`}>
              <img src={data.default_og_image} alt="og preview"
                className="rounded-lg max-h-56 w-full object-cover" />
            </div>
          )}

          <GlassField label="حساب تويتر / X" hint="بدون @ — مثال: etqan_agency">
            <input className={inputCls} value={data.twitter_handle}
              onChange={(e) => setData({ ...data, twitter_handle: e.target.value })} />
          </GlassField>
        </div>
      )}

      {/* --- TAB: ROBOTS --- */}
      {tab === "robots" && (
        <div className="space-y-4">
          <div className={`${glass} rounded-2xl p-6 space-y-3`}>
            <div className="flex items-center gap-2 text-sm text-white font-bold">
              <Bot className="w-4 h-4 text-[#39ff88]" /> ملف robots.txt
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              يحدد الصفحات التي يمكن لمحركات البحث الوصول إليها. اترك القيمة الافتراضية للسماح بفهرسة الموقع كاملاً.
            </p>
            <div className="relative rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#39ff88]/70" />
                <span className="text-[10px] font-mono text-white/40 mr-auto ml-2">robots.txt</span>
              </div>
              <textarea
                className="w-full h-44 bg-transparent p-4 text-[12px] font-mono text-[#c6ffdc] focus:outline-none resize-none leading-relaxed"
                dir="ltr"
                value={data.robots_txt}
                onChange={(e) => setData({ ...data, robots_txt: e.target.value })}
              />
            </div>
          </div>

          <div className={`${glass} rounded-2xl p-6 space-y-3`}>
            <div className="flex items-center gap-2 text-sm text-white font-bold">
              <Globe className="w-4 h-4 text-[#39ff88]" /> روابط إضافية للـ Sitemap
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              أضف أي روابط خارجية تريد إدراجها في خريطة الموقع (رابط في كل سطر).
            </p>
            <div className="relative rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#39ff88]/70" />
                <span className="text-[10px] font-mono text-white/40 mr-auto ml-2">sitemap-extra.txt</span>
              </div>
              <textarea
                className="w-full h-36 bg-transparent p-4 text-[12px] font-mono text-[#c6ffdc] focus:outline-none resize-none leading-relaxed"
                dir="ltr"
                placeholder="https://example.com/extra-page"
                value={data.sitemap_extra}
                onChange={(e) => setData({ ...data, sitemap_extra: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
