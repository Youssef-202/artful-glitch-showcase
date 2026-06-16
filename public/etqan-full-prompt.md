# 🧭 برومت كامل لإعادة بناء موقع وكالة إتقان (Etqan Agency)

استخدم هذا النص كـ **System Prompt / Reference** لأي مساعد ذكي (Lovable / GPT / Claude / Cursor) لإعادة بناء الموقع بالكامل بنفس البنية، المحتوى، التصميم، الانميشنز، وقاعدة البيانات.

---

## 1) نبذة عامة عن المشروع

- **اسم العلامة:** وكالة إتقان (Etqan Agency)
- **الفكرة:** وكالة دعاية وإعلان متخصصة في الخدمات الرقمية (إدارة حسابات، تصوير، محتوى، استراتيجيات، إعلانات، تطوير مواقع، تصميم، علامات تجارية).
- **اللغة الافتراضية:** عربي (RTL) مع دعم كامل للإنجليزية (LTR) عبر زر تبديل اللغة.
- **الثيم:** Dark + Light Mode (الافتراضي داكن) مع زر تبديل.
- **الطابع البصري:** Glassmorphism + Liquid Glass + Neon Teal + Cinematic 3D.
- **السلوقن الرئيسي:** "إبداع رقمي متقن — نصنع التجارب الرقمية التي تُحوّل الأفكار إلى علامات لا تُنسى."

---

## 2) الـ Tech Stack الإلزامي

| الطبقة | التقنية |
|---|---|
| Framework | **React 18 + Vite 5 + TypeScript 5** |
| Styling | **Tailwind CSS v3** + shadcn/ui |
| Routing | `react-router-dom` |
| State/Data | `@tanstack/react-query` |
| Animations | `framer-motion` 11 + `gsap` 3 + Tailwind keyframes |
| 3D | `@react-three/fiber` + `@react-three/drei` |
| Smooth Scroll | `@studio-freight/lenis` |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Backend | **Supabase** (Lovable Cloud) — جداول `services`, `messages`, `blog_posts`, `portfolio_items`, `partners`, `testimonials`, `site_pages`, `user_roles`, `profiles` |
| Fonts | `Almarai` للعربي + `Space Grotesk` + `DM Sans` للإنجليزي |
| Tests | `vitest` |

> ⚠️ **ممنوع:** Next.js / Vue / Angular / Svelte / Server-side rendering.
> ⚠️ **ممنوع:** ألوان مباشرة مثل `text-white` أو `bg-black` أو `bg-[#...]` — استخدم semantic tokens فقط من `index.css`.

---

## 3) نظام التصميم (Design System)

### 3.1 الـ Color Tokens (في `src/index.css`)

**Light Mode (افتراضي للزائر):**
```css
--background: 172 40% 97%;
--foreground: 172 80% 7%;
--primary:    172 95% 22%;   /* Brand Teal #036c5f */
--primary-glow: 172 80% 40%;
--accent:     172 85% 30%;
--secondary:  172 30% 92%;
--muted:      172 25% 92%;
--border:     172 25% 86%;
--destructive: 0 84% 55%;
--radius: 1rem;
```

**Dark Mode (الافتراضي للموقع):**
```css
--background: 172 90% 6%;
--foreground: 172 30% 96%;
--primary:    172 95% 22%;
--primary-glow: 172 80% 45%;
--accent:     172 85% 32%;
--card:       172 80% 9%;
--muted:      172 40% 11%;
--border:     172 40% 16%;
```

### 3.2 Gradients & Shadows
```css
--gradient-primary: linear-gradient(135deg, hsl(172 95% 18%), hsl(172 85% 30%) 50%, hsl(172 75% 45%));
--gradient-radial:  radial-gradient(1200px 600px at 50% -10%, hsl(172 90% 22% / 0.5), transparent 60%);
--shadow-glow:      0 0 40px hsl(172 85% 30% / 0.35);
--shadow-elegant:   0 20px 40px -20px hsl(172 80% 4% / 0.55);
```

### 3.3 Glass System (أساسي في الموقع كله)
- **`.glass`** — backdrop-blur خفيف + border شفاف.
- **`.glass-strong`** — للـ navbar، الكروت الكبيرة، الـ footer.
- **`.liquid-glass`** — للكروت التفاعلية (لمعة + gradient teal/accent).
- **`.btn-liquid-glass`** — للأزرار الأساسية (shimmer عند الـ hover + scale 1.03).
- **`.text-gradient`** — للعناوين الكبيرة (bg-clip-text بـ `--gradient-primary`).

### 3.4 الـ Keyframes الأساسية
```css
@keyframes float-slow   { 0%,100%{translateY(0)} 50%{translateY(-12px)} }   /* 6s infinite */
@keyframes pulse-ring   { 0%{scale(.9) opacity(.7)} 70%{scale(1.6) opacity(0)} }
@keyframes typing-rtl   { from{width:0} to{width:100%} }                     /* Typewriter Arabic */
@keyframes caret-blink  { 0%,100%{transparent} 50%{primary} }
@keyframes animStar     { translateY(0) → translateY(-2000px) }              /* خلفية نجوم */
@keyframes animGravity  /* animDont / animLet / animGo */                    /* انيميشن نصي مرحلي */
@keyframes logoPulse    { hue-rotate + drop-shadow بنبض teal↔accent }
@keyframes accordion-down/up, fade-in/out, scale-in/out, slide-in/out-right
```

### 3.5 الـ Utility Classes الإضافية
- `.story-link` — underline ينبسط من اليمين عند الـ hover.
- `.hover-scale` — `transition-transform hover:scale-105`.
- `.animate-float-slow`, `.animate-pulse-ring`.
- `.typewriter` — لـ Hero العربي.

### 3.6 Typography
- **العربي:** `Almarai, AlJazeera-Arabic, system-ui`.
- **العناوين H1-H6:** `font-black` (900) + `text-gradient`.
- **سطر العنوان العربي:** `line-height: 1.5`, `padding-block: 0.1em`, `overflow: visible` (لمنع قص الهمزات والنقاط).
- **`::selection`** → خلفية `primary/0.4`.

---

## 4) بنية الراوتس (`src/App.tsx`)

```
Public (داخل <Layout/> = Navbar + Outlet + Footer + FloatingCTA):
  /                     → Home
  /services             → ServicesIndex
  /services/:id         → ServiceDetail
  /portfolio            → Portfolio
  /portfolio/:id        → PortfolioDetail
  /blog                 → Blog
  /blog/:id             → BlogPost
  /about                → About
  /contact              → Contact
  *                     → NotFound

Admin (داخل <AdminLayout/> = Cyberpunk Neon Dashboard):
  /admin-dashboard          → AdminOverview
  /admin-dashboard/services → AdminServices  (CRUD على جدول services)
  /admin-dashboard/messages → AdminMessages  (قراءة + حذف من جدول messages)
  /admin-dashboard/guide    → AdminGuide     (دليل الداشبورد المرجعي)
```

**Providers (بهذا الترتيب من الخارج للداخل):**
`QueryClientProvider → ThemeProvider → LanguageProvider → TooltipProvider → Toaster + Sonner → BrowserRouter → Suspense`.

> كل صفحات `/services`, `/portfolio`, `/blog`, `/about`, `/contact`, `/admin-*` تستخدم **lazy import**.

---

## 5) المكونات العامة (Layout)

### 5.1 `Navbar.tsx`
- ثابت `fixed top-0 z-50`، يتقلص عند `scrollY > 30`:
  - يصغر العرض من `1280px → 880px`.
  - يتحول من radius `16px → 999` (كبسولة).
  - يقل padding، تختفي كلمة "وكالة إتقان" بجوار اللوجو.
- Spring animation: `stiffness: 220, damping: 28`.
- Links: `الرئيسية / الخدمات / معرض الأعمال / المدونة / من نحن / تواصل معنا`.
- زر Settings (Popover) فيه:
  - تبديل اللغة (عربي ↔ EN).
  - تبديل الثيم (داكن ↔ فاتح).
- زر Menu (`lg:hidden`) يفتح Mobile Menu بـ `slide + fade`.

### 5.2 `Footer.tsx` (`CinematicFooter` في الـ Home)
- خلفية `glass-strong`، 4 أعمدة:
  1. **Brand** — اللوجو + "مستقبل مشروعك يبدأ الآن مع إتقان".
  2. **روابط سريعة** — الرئيسية، من نحن، الخدمات، أعمالنا، تواصل معنا.
  3. **تواصل معنا:**
     - 📍 الرياض - المملكة العربية السعودية.
     - 📞 `+966 57 351 1722`.
     - ✉️ `info@etqan.com`.
  4. **Socials:** LinkedIn / TikTok / X (Twitter) / Instagram — أيقونات داخل دوائر `glass-strong`.
- خط سفلي: `© جميع الحقوق محفوظة — وكالة إتقان`.

### 5.3 `FloatingCTA.tsx`
- زر دائري عائم أسفل اليمين (RTL) أو اليسار (LTR).
- أيقونة WhatsApp، يفتح رابط واتساب على `+966573511722`.
- يحتوي `animate-pulse-ring` خلفه.

---

## 6) الصفحة الرئيسية (`/` — `Home.tsx`)

**ترتيب الـ Sections بدقة:**

1. **`<ArchitecturalHero/>`** — Hero سينمائي 3D:
   - خلفية: نجوم متحركة (`animStar`) + parallax cosmic background.
   - عنوان رئيسي: `وكالة إتقان` بـ `text-gradient` + typewriter animation.
   - تحته subtitle: "نصنع التجارب الرقمية التي تُحوّل الأفكار إلى علامات لا تُنسى."
   - زرَين: **"استكشف خدماتنا"** → `/services` و **"تواصل معنا"** → `/contact` (كلاهما `.btn-liquid-glass`).
   - مؤشر "مرّر للأسفل" بانيميشن `float-slow`.
2. **`<PartnersLogoCloud/>`** — شريط شعارات الشركاء (يقرأ من جدول `partners`)، marquee متحرك بسرعة بطيئة لا نهائي.
3. **`<ServicesShowcase3D/>`** — شبكة الـ 8 خدمات (انظر القسم 7).
4. **`<PortfolioStack/>`** — استعراض الأعمال (Stack 3D من `usePortfolio`).
5. **Blog Teaser** — أحدث 3 مقالات منشورة من `blog_posts`:
   ```ts
   supabase.from("blog_posts")
     .select("id,title,excerpt,cover_url,category,created_at")
     .eq("published", true)
     .order("created_at", { ascending: false })
     .limit(3)
   ```
   كروت بـ `aspect-video`، hover: `scale-110` للصورة + `-translate-y-1` للكارد.
6. زر **"عرض الكل"** → `/blog`.

كل قسم ملفوف بـ `<Reveal/>` (fade-in + translateY عند الظهور في الـ viewport — `framer-motion whileInView`).

---

## 7) صفحة الخدمات (`/services` — `ServicesIndex.tsx`)

تعتمد على ملف ثابت `src/lib/services.ts` (مصفوفة `Service[]`). كل خدمة:

| ID | الرقم | العنوان | السلوقن | الـ Bullets |
|---|---|---|---|---|
| `account` | 01 | إدارة الحسابات | حضور رقمي يصنع الأثر | تخطيط محتوى شهري · تفاعل وردود مباشرة · تقارير أداء دورية |
| `photo` | 02 | التصوير والإنتاج البصري | كل صورة تحكي قصة | تصوير منتجات · فيديو إعلاني · موشن جرافيك |
| `content` | 03 | كتابة وصناعة المحتوى | كلمات تُقنع وتبيع | مقالات ومدونات · نصوص إعلانية · كتابة هوية صوتية |
| `strategy` | 04 | الخطط والاستراتيجيات التسويقية | خارطة طريق نحو النمو | تحليل المنافسين · تحديد الجمهور · خطة تنفيذية |
| `ads` | 05 | إدارة الحملات الإعلانية | إعلانات تحقق أهدافكم | إعلانات مستهدفة · تحسين A/B · تتبع التحويلات |
| `web` | 06 | تطوير المواقع | تجارب رقمية متكاملة | مواقع تعريفية · متاجر إلكترونية · تطبيقات ويب |
| `design` | 07 | التصميم الجرافيكي | جمالٌ بمعنى | منشورات سوشيال · مطبوعات · هويات بصرية |
| `brand` | 08 | بناء العلامة التجارية | هوية تُذكر وتُحب | استراتيجية العلامة · تصميم الشعار · دليل الهوية |

كل خدمة لها صورة من `src/assets/services/`. الكارد: `liquid-glass` + `framer-motion` بـ stagger، hover يرفع الكارد قليلاً ويُظهر زر "تفاصيل الخدمة" → `/services/{id}`.

---

## 8) صفحة تفاصيل الخدمة (`/services/:id` — `ServiceDetail.tsx`)

- Hero عريض بصورة الخدمة + overlay gradient + عنوان + سلوقن.
- شارات: "الخدمة متاحة الآن" + رقم الخدمة (`01..08`).
- 3 إحصائيات (Cards): معدل الرضا، المشاريع المنجزة، سرعة التسليم.
- قسم **نظرة عامة** — وصف طويل من جدول `services` (`description_ar`).
- قسم **مميزات الخدمة** — bullets مع أيقونات.
- قسم **لماذا تختار هذه الخدمة؟** — 6 أسباب ثابتة من `translations.serviceDetail.reasons`.
- CTA **"تحتاج مساعدة؟"** → `/contact` بأسلوب `liquid-glass`.

---

## 9) صفحة معرض الأعمال (`/portfolio` — `Portfolio.tsx`)

- Hero مع kicker "أعمال مختارة" + عنوان "معرض أعمالنا" + subtitle "تنقّل بين مشاريعنا في عالم ثلاثي الأبعاد."
- Filter Tabs: **الكل / هويات / مواقع / تصاميم / تصوير**.
- يقرأ من `usePortfolio()` → جدول `portfolio_items` مع fallback لـ 4 عناصر:
  - `p1` هوية لونا — لونا للعطور — `#115e59 / #5fd9cf` — branding.
  - `p2` متجر أوريون — أوريون — `#0d4f4a / #7fe3da` — web.
  - `p3` حملة الرياض — ميسم — `#1d7a73 / #a7f0e8` — design.
  - `p4` إنتاج بصري ٢٠٢٤ — كيف — `#0a3d3a / #5fd9cf` — photo.
- كل عنصر يفتح `/portfolio/:id` بصفحة تفاصيل (cover, gallery, process steps, project URL, duration, year, content bilingual).

### `PortfolioStack.tsx` / `PortfolioMarquee.tsx`
- Stack: كروت متراكبة 3D، تتحرك مع scroll (cards-stack effect).
- Marquee: شريط لا نهائي للأعمال يمر يمين/يسار.

---

## 10) صفحة المدونة (`/blog`, `/blog/:id`)

- يقرأ من `blog_posts` (20 عمود): `id, title, slug, excerpt, content, cover_url, category, author, published, created_at, ...`.
- شبكة 3 أعمدة، فلتر بالتصنيف، pagination.
- `BlogPost.tsx` — صفحة مقال كاملة بـ Rich Text rendering + زر "العودة للمدونة".

---

## 11) صفحة من نحن (`/about` — `About.tsx`)

- Header: kicker `تعرّف علينا` + H1 `وكالة إتقان`.
- بطاقة **من نحن**: نص + صورة `aboutWho` (قابل للتعديل من جدول `site_pages` بـ `page_key='about'`).
- بطاقة **رؤيتنا**: نص + صورة `aboutVision` (مرتبة معكوسة).
- بطاقة **لماذا تختارنا؟** — Reasons من نفس الـ `site_pages.content`.
- كل بطاقة `glass-strong rounded-3xl p-12` بـ `motion.div` (`y:30 → 0`, `opacity:0 → 1`, `duration:0.7`).
- ينتهي بـ CTA → `/contact`.

---

## 12) صفحة التواصل (`/contact` — `Contact.tsx`)

- Hero: "نحن هنا للإصغاء — اختر القناة الأنسب لك، وسنرد خلال ساعات."
- 3 بطاقات سريعة: **واتساب / البريد الإلكتروني / اتصال مباشر**.
- نموذج تواصل (react-hook-form + zod):
  - الحقول: **الاسم، البريد الإلكتروني، رقم الجوال، الموضوع، الرسالة**.
  - عند الإرسال:
    ```ts
    await supabase.from("messages").insert({
      name, email, phone, subject, message, status: "new"
    });
    toast.success("تم إرسال رسالتك");
    ```
- جدول `messages` (6 أعمدة): `id, name, email, phone, subject, message, status, created_at`.

---

## 13) قاعدة البيانات (Supabase / Lovable Cloud)

| الجدول | الاستخدام |
|---|---|
| `services` (39 col) | كل خدمة: عناوين/نصوص ثنائية اللغة، صورة، bullets، تفاصيل، stats. |
| `messages` (6 col) | رسائل نموذج التواصل. |
| `blog_posts` (20 col) | المقالات. |
| `portfolio_items` (24 col) | الأعمال (cover, gallery, process steps, urls, bilingual). |
| `partners` (10 col) | شعارات الشركاء. |
| `testimonials` (10 col) | آراء العملاء. |
| `site_pages` (4 col) | محتوى ديناميكي لصفحات (`page_key`, `content` JSONB). |
| `service_orders`, `order_messages`, `order_meetings`, `payments`, `profiles`, `user_roles` | لطبقة الإدارة/الطلبات. |

> **RLS مفعّل على كل جدول.** يجب `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;` و `GRANT ALL TO service_role;` بعد كل `CREATE TABLE`.
> **الأدوار** تُخزّن في `user_roles` فقط (مع enum `app_role`), ودالة `has_role(uuid, app_role)` SECURITY DEFINER.

---

## 14) i18n (`src/i18n/translations.ts` + `LanguageProvider.tsx`)

- `useLang()` يرجّع `{ lang, dir, t, toggleLang }`.
- نسختان كاملتان عربي/إنجليزي لكل النصوص (nav, common, about, contact, portfolio, services, blog, dashboard, auth, serviceDetail).
- `dir = "rtl"` للعربي، `"ltr"` للإنجليزي، يطبق على `<html dir lang>`.
- زر التبديل يبدل اللغة + يحفظ في `localStorage`.

---

## 15) الانميشنز (Motion Catalog)

### framer-motion (في كل الصفحات)
- **Reveal on scroll:** `initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-100px"}} transition={{duration:0.7}}`.
- **Stagger children:** delay = `i * 0.06` للكروت.
- **Navbar morph:** `motion.nav` يتقلص spring (220/28).
- **Hover cards:** `hover:-translate-y-1 hover:shadow-[0_20px_60px_-10px_rgba(3,108,95,0.9)]`.

### GSAP
- يُستخدم في الـ `ArchitecturalHero` لتنسيق تتابع دخول العناصر (timeline).
- في `Intro3D` و `ServicesShowcase3D` لتحريك camera/objects على scroll trigger.

### Three.js (R3F)
- `Intro3D` — مشهد intro قصير عند تحميل الصفحة الأولى.
- `NavLogo3D` — لوجو ثلاثي الأبعاد في الـ Navbar يدور خفيف على hover.
- `PersistentCanvas` — Canvas مشترك مستمر (لا يُعاد إنشاؤه عند تغيير الصفحة) لتحسين الأداء.
- `ServicesShowcase3D` — كروت الخدمات بـ perspective + 3D tilt.

### Lenis Smooth Scroll
- مفعّل عالميًا لتجربة scroll سلسة سينمائية.

### Tailwind keyframes (مستخدمة)
- `accordion-down/up`, `fade-in/out`, `scale-in/out`, `slide-in-right/out-right`,
- مخصصة: `float-slow`, `pulse-ring`, `typing-rtl`, `caret-blink`, `animStar`, `animGravity/Dont/Let/Go`, `logoPulse`.

### Liquid Glass Shimmer
- `.btn-liquid-glass::after` — شريط لمعة 60% بزاوية -20° ينزلق من `-150%` إلى `150%` خلال 0.7s عند hover.

---

## 16) لوحة التحكم (`/admin-dashboard` — Cyberpunk Neon)

- ثيم **داكن نيون** مع gradients teal/cyan مطابقة لألوان الموقع.
- Sidebar ثابت يحتوي: **Overview / Services / Messages / Guide**.
- `AdminOverview` — كروت إحصائيات (عدد الخدمات، عدد الرسائل، آخر تحديث).
- `AdminServices` — CRUD كامل لجدول `services` (Create, Edit dialog, Delete with confirm, Toggle published).
- `AdminMessages` — جدول رسائل قابل للحذف + تغيير `status` (new/read/archived).
- `AdminGuide` — يعرض دليل الداشبورد الكامل + زر "نسخ البرومت".
- لا يوجد Auth داخل الموقع (أُزيلت)؛ الداشبورد مفتوحة على المسار `/admin-dashboard` (يُفضّل حمايتها لاحقًا).

---

## 17) قواعد التطوير الإلزامية

1. **استخدم دائمًا semantic tokens** من `index.css`، ممنوع `text-white / bg-black / bg-[#hex]` في الكومبوننتس.
2. **كل ملف جديد** يستورد `cn` من `@/lib/utils`.
3. **كل صورة** تستخدم `loading="lazy"` + `alt` وصفي بالعربي.
4. **كل نموذج** يستخدم `react-hook-form + zod + toast` (sonner).
5. **كل قسم** يبدأ بـ `kicker` صغير بـ `text-primary tracking-widest`، ثم H2 `font-black` بـ `text-gradient`.
6. **كل بطاقة** تستخدم `liquid-glass` أو `glass-strong` + `rounded-2xl` أو `rounded-3xl`.
7. **كل زر CTA** يستخدم `.btn-liquid-glass` أو gradient `from-primary to-accent` + `shadow-glow`.
8. **كل صفحة** ملفوفة بـ `<Layout/>` تلقائيًا (Navbar + Outlet + Footer + FloatingCTA).
9. **RTL أولاً:** كل `Arrow` تُختار حسب `dir` (`ArrowLeft` للـ rtl، `ArrowRight` للـ ltr).
10. **SEO:** كل صفحة لها `<title>` أقل من 60 حرف + meta description أقل من 160 + H1 واحد + JSON-LD حيث يلزم.

---

## 18) Assets الموجودة في `src/assets/`

- `logo.png`, `etqan-mark.png.asset.json` — اللوجو الرئيسي.
- `about-who.png`, `about-vision.png` — صور صفحة من نحن.
- `services/` — 8 صور (account.png, photo.png, content.png, strategy.png, ads.png, web.jpg, design.jpg, brand.png).
- صور البلوج والبورتفوليو تأتي من الـ DB (URLs).

---

## 19) معلومات الاتصال الفعلية للوكالة

- 📍 **الموقع:** الرياض - المملكة العربية السعودية
- 📞 **الجوال/واتساب:** `+966 57 351 1722`
- ✉️ **البريد:** `info@etqan.com`
- 🌐 **Socials:** LinkedIn، TikTok، X (Twitter)، Instagram
- 🎯 **الشعار:** "مستقبل مشروعك يبدأ الآن مع إتقان"

---

## 20) Checklist تسليم (يجب تحقيقها قبل قول "تم")

- [ ] الموقع يعمل على `npm run dev` بدون أخطاء console.
- [ ] الـ Dark Mode افتراضي، التبديل يعمل ويحفظ.
- [ ] التبديل بين عربي/إنجليزي يعمل ويحفظ، الـ `dir` يتغير.
- [ ] الـ Navbar يتقلص عند الـ scroll بسلاسة (spring).
- [ ] الـ Hero ثلاثي الأبعاد يحمل بدون lag.
- [ ] الـ 8 خدمات تظهر في `/services` وكل واحدة تفتح صفحة تفاصيلها.
- [ ] فورم `/contact` يكتب فعلاً في جدول `messages` ويعرض toast نجاح.
- [ ] `/blog` و `/portfolio` يقرآن من DB ويُظهران fallback نظيف إن كانت فارغة.
- [ ] `/admin-dashboard` يفتح فورًا (بدون شاشة auth) بالثيم النيون.
- [ ] جميع الكروت تستخدم `liquid-glass`، الأزرار `btn-liquid-glass`.
- [ ] لا يوجد `text-white` / `bg-black` / `bg-[#hex]` في أي كومبوننت.
- [ ] الانميشنز كلها تعمل: typewriter، float-slow، pulse-ring، shimmer، reveal، nav-morph.
- [ ] الموقع responsive (mobile / tablet / desktop).

---

> 🧠 **عند أي تعديل مستقبلي:** ارجع لهذا البرومت أولًا، حدّد القسم المتأثر، التزم بالـ tokens والـ animations والـ Bilingual Schema، ولا تُغيّر هوية الموقع أو ألوانه أو طابعه السينمائي.
