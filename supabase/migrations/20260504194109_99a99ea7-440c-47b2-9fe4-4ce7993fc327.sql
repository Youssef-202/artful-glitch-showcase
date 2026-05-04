
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  author_name TEXT,
  category TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts viewable by everyone" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert posts" ON public.blog_posts FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update posts" ON public.blog_posts FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete posts" ON public.blog_posts FOR DELETE USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed sample posts
INSERT INTO public.blog_posts (title, excerpt, content, author_name, category) VALUES
('كيف تبني هوية بصرية لا تُنسى', 'خطوات عملية لبناء هوية تجارية تتحدث بلغة جمهورك.', 'الهوية ليست شعاراً فقط، بل تجربة كاملة... محتوى تجريبي للمقالة.', 'فريق إتقان', 'هوية'),
('استراتيجيات تسويق رقمي لـ 2026', 'أحدث الاتجاهات في عالم التسويق الرقمي.', 'محتوى تجريبي تفصيلي عن استراتيجيات التسويق الرقمي.', 'فريق إتقان', 'تسويق'),
('قوة المحتوى العربي في السوق الخليجي', 'لماذا المحتوى العربي الأصيل هو الأقوى تأثيراً.', 'دراسة معمقة في قوة الكلمة العربية...', 'فريق إتقان', 'محتوى');
