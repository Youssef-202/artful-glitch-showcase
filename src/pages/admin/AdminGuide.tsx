import { BookOpen } from "lucide-react";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "🎯 نظرة عامة",
    body: `لوحة التحكم (Dashboard) هي الواجهة الإدارية لموقع إتقان.

• الوصول: /dashboard (محمي بالـ Auth + role = admin).
• المسارات الفرعية كلها Nested Routes داخل src/pages/Dashboard.tsx.
• التخزين: Supabase (Lovable Cloud) — جداول: blog_posts, services, portfolio_items, partners, testimonials, service_orders, order_messages, order_meetings, site_pages, profiles, user_roles.
• اللغة: العربية افتراضياً (RTL) + دعم إنجليزي في معظم الحقول.
• التصميم: Glassmorphism + Gradient (primary → accent) + tokens من index.css.`,
  },
  {
    title: "🧱 الهيكل العام — Sidebar",
    body: `موجود في Dashboard.tsx ضمن مكوّن Sidebar(). عناصره بالترتيب:

1. LayoutDashboard — لوحة التحكم — /dashboard — نظرة عامة + إحصائيات
2. Home — الصفحة الرئيسية — /dashboard/hero — إدارة Hero + الأقسام الرئيسية
3. Package — الطلبات — /dashboard/orders — إدارة طلبات الخدمات والرسائل والاجتماعات
4. Wrench — الخدمات — /dashboard/services — إدارة الخدمات بكل تفاصيلها
5. FileText — المقالات — /dashboard/posts — إدارة مقالات المدونة
6. Newspaper — صفحة المدونة — /dashboard/blog-page — تخصيص محتوى صفحة /blog
7. Image — المعرض — /dashboard/portfolio — إدارة أعمال البورتفوليو
8. Building2 — الشركاء — /dashboard/partners — إدارة الشركاء وآرائهم
9. Info — من نحن — /dashboard/about — إدارة صفحة /about
🚪 LogOut — تسجيل الخروج — يطلق signOut() ويرجع للرئيسية`,
  },
  {
    title: "1️⃣ Overview — الصفحة الرئيسية للداشبورد",
    body: `الملف: src/pages/Dashboard.tsx → Overview()

يعرض:
• 3 بطاقات إحصائيات: الإجمالي، المنشورة (published = true)، المسودات (published = false).
• قائمة بآخر 5 مقالات (عنوان + تاريخ + أيقونة حالة النشر).

Actions: قراءة فقط — مفيش زراير.`,
  },
  {
    title: "2️⃣ HeroManager — الصفحة الرئيسية / Hero",
    body: `الملف: src/components/admin/HeroManager.tsx
الجدول: site_pages حيث page_key = 'hero' — العمود content JSONB.

الحقول القابلة للتعديل:
• نص علوي صغير (Kicker)
• العنوان الرئيسي
• العنوان الفرعي / الوصف
• نص زرار CTA الأساسي + رابطه
• نص زرار CTA الثانوي + رابطه
• صورة/فيديو الخلفية + alt + caption
• ارتفاع وطريقة عرض الصورة (cover / contain)
• عناوين الأقسام الفرعية (services kicker/title, portfolio kicker/title, ...)

Actions:
💾 حفظ → upsert على site_pages بـ page_key = 'hero'.`,
  },
  {
    title: "3️⃣ OrdersManager — الطلبات",
    body: `الملف: src/components/admin/OrdersManager.tsx
الجداول: service_orders, order_messages, order_meetings, payments.

القائمة الرئيسية:
• جدول/كروت بكل الطلبات: اسم العميل، الخدمة، الحالة، التاريخ، المبلغ.
• فلترة بالحالة: pending | in_review | accepted | in_progress | delivered | cancelled.

عند فتح طلب:
• بيانات العميل (الاسم، الإيميل، التليفون، شركة).
• تفاصيل المتطلبات + المرفقات.

Actions:
✏️ تغيير الحالة (Select) → update على service_orders.status
💬 محادثة الطلب: قراءة + إرسال رسائل في order_messages (مع المرفقات)
📅 جدولة اجتماع: إضافة سجل في order_meetings (تاريخ، رابط، ملاحظات)
💰 تسجيل دفعة: إدخال في payments (المبلغ، الطريقة، الحالة)
🗑️ حذف الطلب (مع تأكيد)`,
  },
  {
    title: "4️⃣ ServicesManager — الأشمل",
    body: `الملف: src/components/admin/ServicesManager.tsx
الجدول: services (39 عمود).

قائمة الخدمات:
• عرض كل الخدمات + حالة النشر + الترتيب.
• زرار ➕ إضافة خدمة جديدة.
• لكل صف: ✏️ تعديل، 🗑️ حذف، 👁️ تبديل النشر.

أ. البيانات الأساسية
• slug — title / title_en — description / description_en — icon (Lucide) — sort_order — published — featured

ب. الصور
• image_url (FileUpload) — image_alt — image_caption — image_fit (cover|contain) — image_height (200-800px)
• gallery (JSONB Array): { url, alt, caption } مع GalleryEditor للإضافة/الحذف/الترتيب.

ج. المحتوى التفصيلي
• hero_subtitle — features — process — faq (Q | A) — tags — deliverables

د. التسعير
• price_from, price_to, currency (EGP|USD|SAR) — duration_estimate — cta_text

هـ. SEO
• seo_title (≤60) — seo_description (≤160) — seo_keywords

و. Overrides لعناوين الأقسام
• features_title/kicker — process_title/kicker — gallery_title/kicker — faq_title/kicker — cta_title/kicker

Actions:
💾 حفظ (Insert/Update على services) — 🔙 إلغاء/رجوع
💡 كل حقل عليه title="" (Tooltip) يشرح وظيفته بالعربي عند الـ Hover.`,
  },
  {
    title: "5️⃣ PostsList + PostForm — المقالات",
    body: `الملف: src/pages/Dashboard.tsx → PostsList, PostForm
الجدول: blog_posts.

القائمة:
• كل المقالات بعناوينها وتصنيفها وتاريخها.
• 👁️ مؤشر حالة النشر — ✏️ تعديل — 🗑️ حذف — ➕ مقال جديد.

نموذج المقال (Bilingual Tabs 🇸🇦 / 🇬🇧):
• title / title_en (≤200)
• author_name / author_name_en (≤100)
• category / category_en (≤50)
• excerpt / excerpt_en (≤500)
• content / content_en (Rich Text Editor — HTML)
• cover_url (FileUpload) — published (Checkbox)

Validation: Zod schema (postSchema).
Actions: 💾 حفظ — 🔙 إلغاء.`,
  },
  {
    title: "6️⃣ BlogPageManager — صفحة المدونة",
    body: `الملف: src/components/admin/BlogPageManager.tsx
الجدول: site_pages (page_key = 'blog').

الحقول:
• Kicker + عنوان الصفحة + الوصف.
• نص "لا توجد مقالات".
• إعدادات الـ Hero الخاص بصفحة /blog.
• SEO (title + description).

Action: 💾 Upsert.`,
  },
  {
    title: "7️⃣ PortfolioManager + PortfolioForm — المعرض",
    body: `الملف: src/pages/Dashboard.tsx
الجدول: portfolio_items (24 عمود).

القائمة:
• كروت بكل عمل + Cover + ألوان (color/accent gradient).
• ✏️ تعديل — 🗑️ حذف — ➕ جديد.

نموذج العمل:
• category: branding | web | design | photo (Enum)
• title_ar + title_en (مطلوب) — client_ar + client_en
• cover_url (FileUpload) — color, accent (Hex)
• sort_order, published
• description_ar + description_en (≤1000)
• content_ar + content_en (≤20000)
• year, duration — project_url
• معرض صور إضافي (MultiFileUpload)

Validation: itemSchema Zod.
Actions: 💾 حفظ — 🔙 إلغاء.`,
  },
  {
    title: "8️⃣ الشركاء + TestimonialsManager",
    body: `الملف: src/components/admin/TestimonialsManager.tsx
الجدول: testimonials.

القائمة:
• كل آراء الشركاء + الصورة + الاسم + المسمى الوظيفي.
• ✏️ تعديل — 🗑️ حذف — 👁️ نشر/إخفاء — ➕ رأي جديد.

نموذج الرأي:
• name (مطلوب، ≤120)
• role (المسمى الوظيفي / الشركة، ≤120)
• quote (نص الرأي، ≤800)
• avatar_url (FileUpload أو URL مباشر)
• sort_order — published

Validation: Zod. Actions: 💾 حفظ — 🔙 إلغاء.

جدول الشركاء (Logos): partners — اسم الشركة، اللوجو، الرابط، الترتيب، النشر.`,
  },
  {
    title: "9️⃣ AboutManager — من نحن",
    body: `الملف: src/components/admin/AboutManager.tsx
الجدول: site_pages (page_key = 'about').

الأقسام:
• العنوان الرئيسي: kicker + title.
• قسم "من نحن": kicker + title + body + image + image_fit + image_height.
• قسم "رؤيتنا": نفس الحقول.
• قسم "لماذا تختارنا؟": kicker + title + Array من الأسباب ({title, body}) — ➕ إضافة، 🗑️ حذف لكل سبب.

Action: 💾 حفظ (Upsert على site_pages).`,
  },
  {
    title: "🔐 الأمان (RLS)",
    body: `• كل جدول عليه Row-Level Security.
• جداول الإدارة: السماح فقط لمن لديه has_role(auth.uid(), 'admin').
• القراءة العامة: مسموحة فقط للصفوف published = true للزوار.
• الكتابة: محصورة بالأدمن عبر function has_role (SECURITY DEFINER).`,
  },
  {
    title: "🧩 مكونات مشتركة",
    body: `• FileUpload (src/components/FileUpload.tsx): رفع ملف واحد لـ Supabase Storage (folder configurable).
• MultiFileUpload: رفع متعدد.
• RichTextEditor: محرر HTML غني (TipTap-like) — يدعم RTL.
• Toast (sonner): إشعارات النجاح/الخطأ.
• Zod: تحقق من كل النماذج قبل الإرسال.`,
  },
  {
    title: "🛠️ Actions القياسية في كل قسم CRUD",
    body: `• إضافة → setCreating(true) ثم Form → insert
• تعديل → setEditing(item) ثم Form → update .eq('id', id)
• حذف → confirm() ثم استدعاء → delete .eq('id', id)
• تبديل النشر → Checkbox/Switch → update { published }
• ترتيب → حقل رقمي sort_order → update { sort_order }
• رفع صورة → FileUpload → Storage → URL يُحفظ في عمود`,
  },
  {
    title: "🌐 i18n",
    body: `• مخزّن في src/i18n/translations.ts.
• Hook: useLang() → { lang, dir, t, setLang, toggleLang }.
• معظم الحقول لها نسختين (ar + en) في DB.`,
  },
  {
    title: "📋 تعليمات استخدام البرومت",
    body: `أنت مساعد ذكي لمنصة "إتقان". لما المستخدم يطلب أي تعديل في الداشبورد:

1. حدد القسم من الجدول أعلاه.
2. افتح الملف المناسب من المسارات.
3. اعرف الجدول والأعمدة المتأثرة.
4. لو الطلب فيه حقل جديد → اعمل Migration + Update للـ Manager + Update للصفحة العامة.
5. التزم بـ: Zod validation، Toast notifications، RLS، Bilingual fields، Tooltips بالعربي على كل input.
6. استخدم Tokens من index.css ولا تستخدم ألوان مباشرة (text-white, bg-black).`,
  },
];

const FULL_PROMPT = SECTIONS.map((s) => `## ${s.title}\n\n${s.body}`).join("\n\n");

export default function AdminGuide() {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FULL_PROMPT);
      alert("تم نسخ البرومت بالكامل ✅");
    } catch {
      alert("تعذّر النسخ — انسخ يدوياً من الأسفل.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-panel rounded-xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white text-glow-cyan">دليل الداشبورد الكامل (System Prompt)</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              استخدمه كمرجع لأي مساعد ذكي (Lovable / GPT / Claude) لفهم بنية اللوحة، كل قسم، كل زرار، وكل اكشن.
            </p>
          </div>
        </div>
        <button
          onClick={copy}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20"
        >
          نسخ البرومت كاملاً
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="cyber-panel rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-cyan-400 text-glow-cyan border-b border-cyan-500/10 pb-2">
              {s.title}
            </h3>
            <pre className="text-[11px] leading-6 text-slate-300 whitespace-pre-wrap font-sans">{s.body}</pre>
          </div>
        ))}
      </div>

      <div className="cyber-panel rounded-xl p-5">
        <h3 className="text-sm font-bold text-pink-400 text-glow-pink mb-3 border-b border-pink-500/10 pb-2">
          النص الكامل (للنسخ المباشر)
        </h3>
        <pre className="text-[10px] leading-5 text-slate-400 whitespace-pre-wrap font-mono bg-slate-950/60 border border-slate-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
{FULL_PROMPT}
        </pre>
      </div>
    </div>
  );
}
