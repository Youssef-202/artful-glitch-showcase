CREATE TABLE public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  avatar_url text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_by uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published testimonials viewable by everyone"
ON public.testimonials FOR SELECT
USING (published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update testimonials"
ON public.testimonials FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete testimonials"
ON public.testimonials FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.testimonials (name, role, quote, sort_order) VALUES
('أحمد المنصوري', 'الرئيس التنفيذي', 'فريق إتقان غيّر شكل علامتنا التجارية بالكامل، نتائج فاقت توقعاتنا.', 1),
('سارة الخالدي', 'مديرة التسويق', 'احترافية وسرعة في التنفيذ وإبداع لا يتوقف. شركاء نجاح حقيقيون.', 2),
('محمد عبدالله', 'مؤسس', 'تجربة مميزة من أول لقاء، فهموا فكرتنا ونفذوها بشكل أفضل مما تخيلنا.', 3);