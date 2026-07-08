
-- 1) role column with 4 tiers
DO $$ BEGIN
  CREATE TYPE public.admin_role AS ENUM ('owner','deputy','leader','editor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS role public.admin_role NOT NULL DEFAULT 'editor';

-- seed / normalize main owner
UPDATE public.admin_users SET role = 'owner'
  WHERE lower(email) = 'youssf582022@gmail.com';

-- ensure exactly one owner if none set: promote oldest row
DO $$
DECLARE has_owner boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE role='owner') INTO has_owner;
  IF NOT has_owner THEN
    UPDATE public.admin_users SET role='owner'
      WHERE id = (SELECT id FROM public.admin_users ORDER BY created_at ASC LIMIT 1);
  END IF;
END $$;

-- 2) helper: current user's admin role
CREATE OR REPLACE FUNCTION public.current_user_admin_role()
RETURNS public.admin_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT a.role FROM public.admin_users a
  JOIN auth.users u ON lower(u.email) = lower(a.email)
  WHERE u.id = auth.uid()
  LIMIT 1
$$;
