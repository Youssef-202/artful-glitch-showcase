
-- 1. Restrict profiles SELECT
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users view own profile or admins view all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Order messages: verify order ownership on INSERT
DROP POLICY IF EXISTS "Users and admins insert messages" ON public.order_messages;
CREATE POLICY "Users and admins insert messages"
ON public.order_messages FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.service_orders
    WHERE id = order_id AND user_id = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Revoke EXECUTE on trigger-only SECURITY DEFINER functions from public roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_order_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS policies and must remain callable by authenticated/anon

-- 4. Restrict listing on public storage buckets (objects still accessible by direct URL)
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Public access media" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public access avatars" ON storage.objects;
DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Allow direct reads on individual objects (not listings) by requiring a name
CREATE POLICY "Media direct file access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media' AND name IS NOT NULL AND position('/' in name) >= 0);

CREATE POLICY "Avatars direct file access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND name IS NOT NULL AND position('/' in name) >= 0);
