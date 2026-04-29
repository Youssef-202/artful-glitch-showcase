
# موقع وكالة إبداعية — تجربة 3D كاملة

موقع صفحة واحدة (SPA) باللغة العربية مع تخطيط RTL، ثيم داكن، لمسة زجاجية (glassmorphism)، ولون أساسي `#3565F5`. ٨ أقسام خدمات كل منها بمشهد ثلاثي الأبعاد مستقل.

## الهيكل العام للصفحة

```text
[Loading Screen 3D]
   ↓
[Cursor Follower + Particles Background ثابت خلف كل القسم]
   ↓
1. Hero (اسم الشركة + شعار + كرة/شبكة 3D متحركة)
2. About / مقدمة قصيرة
3-10. ٨ أقسام خدمات (واحد تلو الآخر، scroll-snap)
11. Footer مختصر
[Floating CTA — واتساب/بريد — bottom-right]
```

## الأقسام الثمانية

| # | الخدمة | المشهد ثلاثي الأبعاد |
|---|--------|---------------------|
| 01 | إدارة الحسابات | لوحة بيانات عائمة + رسوم بيانية بأعمدة متحركة |
| 02 | التصوير والإنتاج البصري | عدسة كاميرا (أسطوانات + حلقات) مع سحابة جزيئات |
| 03 | كتابة وصناعة المحتوى | حروف عربية ثلاثية الأبعاد عائمة فوق لوحة مفاتيح |
| 04 | الخطط والاستراتيجيات التسويقية | منحنى نمو/خط طريق بنقاط مضيئة |
| 05 | إدارة الحملات الإعلانية | مخروط مكبّر صوت + تيارات بيانات (lines + particles) |
| 06 | تطوير المواقع | نافذة متصفح 3D مع تأثير كتابة كود |
| 07 | التصميم الجرافيكي | كرات ألوان متحوّلة + قلم Bezier متحرك |
| 08 | بناء العلامة التجارية | قطع شعار تتجمع من الفضاء إلى مكانها |

كل قسم: عنوان كبير + وصف قصير + بطاقة زجاجية + مشهد 3D على الجانب. عند hover على بطاقة الخدمة، يدور/يتفاعل المشهد.

## التفاعلات

- **Smooth scroll** عبر Lenis، مع `scroll-snap` على الأقسام في الديسكتوب فقط (يُعطّل على الموبايل لتجربة أفضل).
- **GSAP ScrollTrigger** لكل قسم: fade + translate + scale للنصوص، وتغيير زاوية الكاميرا/دوران المشهد.
- **Cursor follower**: دائرة blur مع وهج بلون `#3565F5` تتبع المؤشر بسلاسة (مخفي على الموبايل).
- **Particles خلفية ثابتة**: نجوم/جزيئات في `<Canvas>` واحد خلف الـ DOM (`fixed inset-0 -z-10`).
- **Hover على البطاقات**: زيادة سرعة الدوران + إضاءة إضافية.
- **Page enter transition**: fade + scale عند انتهاء التحميل.

## شاشة التحميل

`<Canvas>` صغير مع كرة wireframe دوّارة + نص "...جاري التحميل" + شريط تقدم. تُخفى عند `useProgress().active === false` من drei.

## Floating CTA

زر دائري ثابت `bottom-right` (يسار في RTL سيكون يمين بصرياً = نفس المكان عبر `right-6`)، يفتح رابط واتساب (`https://wa.me/`) في تبويب جديد. micro-interaction: نبض + scale عند hover + أيقونة تتحرك.

اسم الشركة سيظل **`[اسم الشركة]`** كنص نائب في كل المواضع (Hero, Footer, meta tags, CTA tooltip).

## الجوانب التقنية

- **Stack**: المشروع الحالي React 18 + Vite + Tailwind v3 + TypeScript. سنبقى عليه (لا CDN).
- **حزم نضيفها بإصدارات متوافقة مع React 18**:
  - `three@0.160.x`
  - `@react-three/fiber@^8.18`
  - `@react-three/drei@^9.122`
  - `gsap` (مع ScrollTrigger)
  - `framer-motion`
  - `@studio-freight/lenis` (smooth scroll)
- **التقسيم إلى ملفات** (وداعاً لمتطلب الملف الواحد — مع موافقتك على بنية React/Vite):
  ```text
  src/
    pages/Index.tsx               # تركيب كل الأقسام
    components/
      Loader.tsx                  # شاشة تحميل 3D
      CursorFollower.tsx
      FloatingCTA.tsx
      ParticleBackground.tsx      # Canvas خلفي ثابت
      SectionShell.tsx            # غلاف قسم (snap + glass + scroll trigger)
      Hero.tsx
      services/
        AccountMgmt3D.tsx
        Photography3D.tsx
        Content3D.tsx
        Strategy3D.tsx
        AdsCampaign3D.tsx
        WebDev3D.tsx
        GraphicDesign3D.tsx
        Branding3D.tsx
      ServiceSection.tsx          # غلاف موحّد لكل خدمة (نص + سلوت 3D)
    hooks/
      useLenis.ts
      useScrollReveal.ts          # GSAP wrapper
    lib/
      services.ts                 # بيانات الخدمات الثمانية (عناوين عربية، أوصاف)
  ```
- **الأداء**:
  - `<Suspense fallback={<Loader/>}>` حول كل مشهد ثقيل.
  - `lazy()` على مشاهد الخدمات (تُحمَّل عند اقتراب القسم عبر IntersectionObserver — مكوّن `LazyScene`).
  - `dpr={[1, 2]}` و `frameloop="demand"` للمشاهد الثانوية، `"always"` للمشهد المرئي حالياً.
  - تعطيل المشاهد عندما تكون خارج الـ viewport (`useInView`).
  - تقليل الـ particles على الموبايل (تحقّق `matchMedia`).
- **RTL**:
  - `<html dir="rtl" lang="ar">` في `index.html`.
  - خط عربي: Tajawal أو Cairo عبر Google Fonts (محمّل في `index.html`).
  - تحديث `tailwind.config.ts` بإضافة `fontFamily.sans = ['Tajawal', ...]`.
- **نظام التصميم** (في `src/index.css` — تحديث متغيرات HSL):
  - `--background: 222 47% 5%` (داكن)
  - `--primary: 222 91% 58%` (≈ #3565F5)
  - `--accent: 222 91% 65%`
  - بطاقات زجاجية: `bg-white/5 backdrop-blur-xl border border-white/10`
  - تدرّجات: `from-[#3565F5] via-[#5B7CF7] to-[#8A9FFA]`
- **SEO**: تحديث `index.html` بـ `<title>`, `meta description`, `og:*`, `twitter:*` بالعربية، و `lang="ar"`, `dir="rtl"`.
- **استجابة**: شبكة `grid-cols-1 lg:grid-cols-2` في كل قسم خدمة (نص + 3D)، الكانفاس بارتفاع `h-[50vh] lg:h-screen`.

## ملاحظات مهمة (انحرافات مقصودة عن طلبك)

1. **ليس ملف HTML واحد بـ CDN** — اخترتَ "مشروع React/Vite كامل" في الأسئلة، لذلك سأستخدم بنية المشروع الحالية بدلاً من CDN، مع تقسيم نظيف للمكوّنات.
2. **اسم الشركة** سيظل حرفياً `[اسم الشركة]` في الكود. استبدله لاحقاً بكلمة بحث/استبدال واحدة.
3. **النماذج 3D**: مشاهد إجرائية (procedural) من primitives + shaders + drei helpers — بدون ملفات GLTF خارجية، حسب اختيارك "متوسط".
4. **CTA**: زر واتساب عائم فقط (رقم placeholder `+9665XXXXXXXX` تستبدله لاحقاً)، بدون نموذج اتصال.

