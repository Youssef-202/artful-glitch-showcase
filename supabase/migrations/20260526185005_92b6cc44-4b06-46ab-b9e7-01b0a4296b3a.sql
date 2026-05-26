CREATE TABLE public.site_pages (
  page_key text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_pages TO anon;
GRANT SELECT ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site pages are public"
ON public.site_pages FOR SELECT
USING (true);

CREATE POLICY "Admins insert site pages"
ON public.site_pages FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update site pages"
ON public.site_pages FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete site pages"
ON public.site_pages FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_pages_set_updated_at
BEFORE UPDATE ON public.site_pages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_pages (page_key, content) VALUES (
  'about',
  '{
    "header_kicker": "تعرّف علينا",
    "header_title": "وكالة إتقان",
    "who_kicker": "نبذة عنّا",
    "who_title": "من نحن",
    "who_body": "وكالة إتقان هي وكالة دعاية وإعلان متخصّصة في تقديم خدمات الإعلان والتصميم والتسويق الرقمي بأعلى مستوى من الدقة والاحترافية وبكل الطرق الممكنة. نرسم لعلامتك التجارية خطوطها العريضة بناءً على دراسة معمّقة للسوق والمنافسين، ونبدأ معك من البداية بتحديد الجدوى من المشروع واختيار الوسائل الإعلانية الأكثر تأثيراً، لنعمل جاهدين على تحقيق كافة الأهداف التي تطمح إليها علامتك.",
    "who_image": "",
    "vision_kicker": "إلى أين نتجه",
    "vision_title": "رؤيتنا",
    "vision_body": "تسعى وكالة إتقان لأن تكون الشريك الأول للمؤسسات والشركات في رحلة نموّها، عبر تقديم حلول إعلانية وتسويقية مبتكرة وقادرة على تحقيق أهداف علامتك بأذكى الطرق وأكثرها تأثيراً، لنصنع معاً قصص نجاح حقيقية تستحق أن تُروى.",
    "vision_image": "",
    "reasons_kicker": "ما يميّزنا",
    "reasons_title": "لماذا تختارنا ؟",
    "reasons": [
      {"title": "الإبداع", "body": "نقدّم خلفية متنوّعة في الإعلان والتصميم والعلامات التجارية والعلاقات العامة، بالإضافة إلى التخطيط الاستراتيجي للعمل في شركتك."},
      {"title": "الاهتمام بالتفاصيل", "body": "اهتمامنا بالأشياء الصغيرة وتخطيط الجداول الزمنية وإدارة المشاريع الصعبة هو ما يجعلنا متميّزين عن البقية."},
      {"title": "وضع خطة للنجاح", "body": "تريد نتائج؟ أفضل طريقة هي البحث المسبق لشركتك والمنافسين والسوق المستهدف."},
      {"title": "المواعيد والتسليمات", "body": "لقد عملنا مع مجموعة مختارة من المؤسسات لسنوات عديدة، ولم نفوّت أي موعد نهائي."},
      {"title": "الأسعار", "body": "أسعارنا تنافسية وعادلة. لا توجد فواتير مفاجئة."},
      {"title": "خبراء", "body": "تتكوّن وكالة إتقان من متخصّصين في الإعلان والتصميم لديهم خبرة واسعة."}
    ]
  }'::jsonb
);