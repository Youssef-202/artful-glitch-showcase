## الهدف
إضافة قدرة في الداش بورد على التحكم بشكل منفصل في محتوى الكروت (الصور + ألوان النصوص) بين الوضع الفاتح (Light) والوضع الغامق (Dark) لثلاثة أقسام:
1. الخدمات (Services)
2. معرض الأعمال (Portfolio)
3. المدونة (Blog)

بحيث لو تركت الحقول الخاصة بأحد الوضعين فارغة، يتم استخدام القيمة الافتراضية.

## نطاق الحقول التي تُفصل حسب الوضع

**الصور:**
- Portfolio: `home_cover_url_light`, `portfolio_cover_url_light`, `detail_cover_url_light` (بجانب النسخ الحالية التي ستُعامل كـ Dark)
- Services: `home_image_url_light`, `services_page_image_url_light`, `image_url_light`
- Blog: `cover_url_light` (بجانب `cover_url` الحالي)

**ألوان النصوص:**
- Portfolio: `home_title_color_light` / `home_client_color_light` + `portfolio_title_color_light` / `portfolio_client_color_light`
- Services: `home_title_color_light` / `home_tagline_color_light` + `title_color_light` / `tagline_color_light`
- Blog: `title_color_light` (اختياري)

## التغييرات التقنية

**1. Migration** — إضافة الأعمدة الجديدة (`*_light`) لجداول `portfolio_items` و `services` و `blog_posts` (كلها Nullable مع GRANT مناسب).

**2. Admin UI** — في كل حوار تعديل من الثلاثة أضيف تبويب/قسم "الوضع الفاتح" فيه نفس الحقول (صور + ألوان) لكن تسري فقط على اللايت مود.

**3. Frontend Rendering** — استخدام hook `useTheme()` الموجود لاختيار الحقل المناسب:
```
const isLight = theme === "light";
const cover = (isLight && item.homeCoverUrlLight) || item.homeCoverUrl;
```
التعديل يشمل:
- `PortfolioStack.tsx` (Home)
- `Portfolio.tsx` (صفحة المعرض)
- `PortfolioDetail.tsx` (صفحة تفاصيل العمل)
- `ServicesShowcase3D.tsx` (Home)
- `ServicesIndex.tsx` (صفحة الخدمات)
- `Blog.tsx` (كروت المدونة)

**4. Types** — تحديث `usePortfolio.ts` و `useServices.ts` والـ types لتشمل الحقول الجديدة.

## سلوك الـ Fallback
لو الحقل الخاص بالـ Light فاضي → يتم استخدام القيمة الأصلية (اللي بتشتغل حاليًا في الدارك). عشان الموقع ميتأثرش لحد ما تبدأ تدخل قيم للايت مود.

هل أبدأ التنفيذ؟
