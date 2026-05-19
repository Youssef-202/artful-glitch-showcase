
-- 1) Services table (move services from code to DB, with rich detail fields)
CREATE TABLE public.services (
  id text PRIMARY KEY,
  number text NOT NULL DEFAULT '00',
  title text NOT NULL,
  tagline text,
  description text,
  long_description text,
  image_url text,
  bullets text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  process_steps text[] NOT NULL DEFAULT '{}',
  deliverables text[] NOT NULL DEFAULT '{}',
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_from numeric,
  currency text NOT NULL DEFAULT 'EGP',
  duration text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published services viewable by everyone"
  ON public.services FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert services"
  ON public.services FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update services"
  ON public.services FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete services"
  ON public.services FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with the 8 existing services
INSERT INTO public.services (id, number, title, tagline, description, bullets, sort_order) VALUES
  ('account','01','إدارة الحسابات','حضور رقمي يصنع الأثر','ندير حساباتكم على منصات التواصل الاجتماعي بفكر استراتيجي وتفاعل يومي يبني مجتمعاً حقيقياً حول علامتكم.','{"تخطيط محتوى شهري","تفاعل وردود مباشرة","تقارير أداء دورية"}',1),
  ('photo','02','التصوير والإنتاج البصري','كل صورة تحكي قصة','جلسات تصوير احترافية وإنتاج فيديوهات بصرية تنقل هوية علامتكم بأسلوب سينمائي يلفت الأنظار.','{"تصوير منتجات","فيديو إعلاني","موشن جرافيك"}',2),
  ('content','03','كتابة وصناعة المحتوى','كلمات تُقنع وتبيع','محتوى عربي إبداعي مُحسَّن لمحركات البحث ومنصات التواصل، يتحدث بلغة جمهوركم ويحرك قراراتهم.','{"مقالات ومدونات","نصوص إعلانية","كتابة هوية صوتية"}',3),
  ('strategy','04','الاستراتيجية التسويقية','خطة تقودكم للنجاح','نضع لكم خارطة طريق تسويقية متكاملة مبنية على بحث السوق وتحليل المنافسين وفهم جمهوركم.','{"تحليل السوق","تحديد الجمهور","خطة محتوى وقنوات"}',4),
  ('ads','05','الحملات الإعلانية','إعلانات تحقق نتائج','نطلق ونُدير حملات إعلانية على جوجل وميتا وتيك توك بميزانية ذكية تضاعف عوائدكم.','{"حملات جوجل وميتا","إعادة الاستهداف","تحسين معدل التحويل"}',5),
  ('web','06','تصميم وتطوير المواقع','هوية رقمية لا تُنسى','نصمم ونطور مواقع إلكترونية سريعة وآمنة وجاهزة لمحركات البحث تعكس احترافية علامتكم.','{"تصميم UX/UI","مواقع متجاوبة","متاجر إلكترونية"}',6),
  ('design','07','التصميم الإبداعي','تصاميم تأسر العين','تصاميم جرافيك تجمع بين الإبداع والوظيفة لكل احتياجاتكم البصرية على الإنترنت وخارجه.','{"بوستات سوشيال","بروشورات ومطبوعات","تصميم منتجات"}',7),
  ('brand','08','بناء الهوية البصرية','هوية تخلّد علامتكم','نبني هوية بصرية متكاملة تميّز علامتكم بشكل احترافي ومتسق عبر جميع نقاط التواصل.','{"شعار احترافي","دليل هوية","نظام بصري متكامل"}',8);

-- 2) Profile extra fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS website text;

-- 3) Order meetings (scheduled contact / meetings)
CREATE TABLE public.order_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  channel text NOT NULL DEFAULT 'call',
  location text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order meetings"
  ON public.order_meetings FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins insert order meetings"
  ON public.order_meetings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins update order meetings"
  ON public.order_meetings FOR UPDATE
  USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete order meetings"
  ON public.order_meetings FOR DELETE
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER order_meetings_set_updated_at
  BEFORE UPDATE ON public.order_meetings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Order messages (communication log between admin and user)
CREATE TABLE public.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  sender text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order messages"
  ON public.order_messages FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users and admins insert messages"
  ON public.order_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete messages"
  ON public.order_messages FOR DELETE
  USING (public.has_role(auth.uid(),'admin'));
