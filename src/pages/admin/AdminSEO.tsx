import { useEffect, useState } from "react";
import { Search, Save, Loader2, AlertCircle, Plus, Trash2, Globe, FileText, Bot, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Field, inputCls, textareaCls } from "./_shared/uploaders";

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
  default_description: "وكالة إتقان — نصمم هويات بصرية وتجارب رقمية متقنة تعبّر عن قصتك وتصنع أثراً حقيقياً.",
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

export default function AdminSEO() {
  const [data, setData] = useState<SEOData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [tab, setTab] = useState<"general" | "pages" | "social" | "robots">("general");

  useEffect(() => {
    (async () => {
      const { data: row } = await (supabase as any).from("site_pages").select("content").eq("page_key", "seo").maybeSingle();
      if (row?.content) setData({ ...defaultData, ...row.content, pages: row.content.pages ?? defaultData.pages });
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
  const removePage = (i: number) => setData({ ...data, pages: data.pages.filter((_, x) => x !== i) });

  if (loading) return <div className="p-12 text-center text-slate-500 text-sm">جاري التحميل...</div>;

  const tabs = [
    { id: "general", label: "الإعدادات العامة", icon: Globe },
    { id: "pages", label: "سيو الصفحات", icon: FileText },
    { id: "social", label: "المشاركة الاجتماعية", icon: Share2 },
    { id: "robots", label: "الزواحف والفهرسة", icon: Bot },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" /> محركات البحث والسيو
          </h3>
          <p className="text-xs text-slate-400 mt-1">تحكّم كامل في ظهور الموقع على Google وباقي محركات البحث</p>
        </div>
        <button disabled={saving} onClick={save} className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التغييرات
        </button>
      </div>

      {err && <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"><AlertCircle className="w-4 h-4 inline ml-1" /> {err}</div>}
      {ok && <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">✓ {ok}</div>}

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tb) => {
          const Ic = tb.icon;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                tab === tb.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300"
                  : "bg-slate-900/40 text-slate-400 hover:text-white"
              }`}
            >
              <Ic className="w-4 h-4" /> {tb.label}
            </button>
          );
        })}
      </div>

      {tab === "general" && (
        <div className="cyber-panel rounded-xl p-6 space-y-4">
          <Field label="اسم الموقع" hint="يظهر بجانب عنوان كل صفحة"><input className={inputCls} value={data.site_name} onChange={(e) => setData({ ...data, site_name: e.target.value })} /></Field>
          <Field label="العنوان الافتراضي (Meta Title)" hint="60 حرف كحد أقصى — يظهر في نتائج البحث"><input className={inputCls} maxLength={70} value={data.default_title} onChange={(e) => setData({ ...data, default_title: e.target.value })} /><div className="text-[10px] text-slate-500 mt-1">{data.default_title.length}/60</div></Field>
          <Field label="الوصف الافتراضي (Meta Description)" hint="160 حرف كحد أقصى — الوصف الذي يظهر تحت العنوان في Google"><textarea className={textareaCls + " h-24"} maxLength={180} value={data.default_description} onChange={(e) => setData({ ...data, default_description: e.target.value })} /><div className="text-[10px] text-slate-500 mt-1">{data.default_description.length}/160</div></Field>
          <Field label="الكلمات المفتاحية (Keywords)" hint="افصل بينها بفاصلة"><input className={inputCls} value={data.default_keywords} onChange={(e) => setData({ ...data, default_keywords: e.target.value })} /></Field>
          <Field label="Google Site Verification" hint="كود التحقق من Google Search Console"><input className={inputCls} placeholder="مثال: xyz123..." value={data.google_site_verification} onChange={(e) => setData({ ...data, google_site_verification: e.target.value })} /></Field>
        </div>
      )}

      {tab === "pages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">اضبط عنوان ووصف كل صفحة على حدة. اترك الحقول فارغة لاستخدام القيم الافتراضية.</p>
            <button onClick={addPage} className="px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> صفحة جديدة</button>
          </div>
          {data.pages.map((p, i) => (
            <div key={i} className="cyber-panel rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-cyan-400 font-mono text-xs">{i + 1}.</span>
                  <input placeholder="/path" className={inputCls + " max-w-xs font-mono text-xs"} value={p.path} onChange={(e) => updatePage(i, { path: e.target.value })} />
                </div>
                <button onClick={() => removePage(i)} className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="عنوان الصفحة"><input className={inputCls} maxLength={70} value={p.title} onChange={(e) => updatePage(i, { title: e.target.value })} /></Field>
                <Field label="الكلمات المفتاحية"><input className={inputCls} value={p.keywords} onChange={(e) => updatePage(i, { keywords: e.target.value })} /></Field>
              </div>
              <Field label="وصف الصفحة"><textarea className={textareaCls + " h-20"} maxLength={180} value={p.description} onChange={(e) => updatePage(i, { description: e.target.value })} /></Field>
              <Field label="صورة المشاركة (OG Image URL)"><input className={inputCls} placeholder="https://..." value={p.og_image} onChange={(e) => updatePage(i, { og_image: e.target.value })} /></Field>
            </div>
          ))}
        </div>
      )}

      {tab === "social" && (
        <div className="cyber-panel rounded-xl p-6 space-y-4">
          <Field label="صورة المشاركة الافتراضية (OG Image)" hint="1200x630 بكسل مثالية — تظهر عند مشاركة الموقع على منصات التواصل"><input className={inputCls} placeholder="https://..." value={data.default_og_image} onChange={(e) => setData({ ...data, default_og_image: e.target.value })} /></Field>
          {data.default_og_image && <img src={data.default_og_image} alt="og preview" className="rounded-lg border border-slate-800 max-h-48 object-cover" />}
          <Field label="حساب تويتر / X" hint="بدون @ — مثال: etqan_agency"><input className={inputCls} value={data.twitter_handle} onChange={(e) => setData({ ...data, twitter_handle: e.target.value })} /></Field>
        </div>
      )}

      {tab === "robots" && (
        <div className="space-y-4">
          <div className="cyber-panel rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white font-bold"><Bot className="w-4 h-4 text-cyan-400" /> ملف robots.txt</div>
            <p className="text-xs text-slate-400">يحدد الصفحات التي يمكن لمحركات البحث الوصول إليها. اترك القيمة الافتراضية للسماح بفهرسة الموقع كاملاً.</p>
            <textarea className={textareaCls + " h-40 font-mono text-xs"} value={data.robots_txt} onChange={(e) => setData({ ...data, robots_txt: e.target.value })} />
          </div>
          <div className="cyber-panel rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-white font-bold"><Globe className="w-4 h-4 text-cyan-400" /> روابط إضافية للـ Sitemap</div>
            <p className="text-xs text-slate-400">أضف أي روابط خارجية تريد إدراجها في خريطة الموقع (رابط في كل سطر).</p>
            <textarea className={textareaCls + " h-32 font-mono text-xs"} placeholder="https://example.com/extra-page" value={data.sitemap_extra} onChange={(e) => setData({ ...data, sitemap_extra: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}
