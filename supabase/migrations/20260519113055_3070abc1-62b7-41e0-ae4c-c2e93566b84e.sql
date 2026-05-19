
-- Extend profiles with user info
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Service orders
CREATE TABLE IF NOT EXISTS public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_key text NOT NULL,
  service_name_ar text NOT NULL,
  service_name_en text,
  description text,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EGP',
  current_stage smallint NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 4),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','review','completed','cancelled')),
  stage1_name text NOT NULL DEFAULT 'استلام الطلب',
  stage2_name text NOT NULL DEFAULT 'قيد التنفيذ',
  stage3_name text NOT NULL DEFAULT 'المراجعة والتعديلات',
  stage4_name text NOT NULL DEFAULT 'التسليم النهائي',
  stage1_completed_at timestamptz,
  stage2_completed_at timestamptz,
  stage3_completed_at timestamptz,
  stage4_completed_at timestamptz,
  estimated_delivery date,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.service_orders
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own orders" ON public.service_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.service_orders
  FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete orders" ON public.service_orders
  FOR DELETE USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER set_service_orders_updated BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EGP',
  method text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert payments" ON public.payments
  FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payments" ON public.payments
  FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete payments" ON public.payments
  FOR DELETE USING (has_role(auth.uid(),'admin'));

-- Update paid_amount on payment changes
CREATE OR REPLACE FUNCTION public.recalc_order_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE oid uuid;
BEGIN
  oid := COALESCE(NEW.order_id, OLD.order_id);
  UPDATE public.service_orders SET paid_amount = COALESCE((
    SELECT SUM(amount) FROM public.payments WHERE order_id = oid AND status = 'completed'
  ),0) WHERE id = oid;
  RETURN NEW;
END $$;

CREATE TRIGGER payments_recalc AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_order_paid();

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.service_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
