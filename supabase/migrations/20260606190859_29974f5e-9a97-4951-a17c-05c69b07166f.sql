
-- Fix: explicit admin-only UPDATE policy on order_messages
CREATE POLICY "Admins update messages"
ON public.order_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix: prevent users from setting arbitrary total_amount on service_orders.
-- Force total_amount to 0 on user insert; admins set the real price via UPDATE.
DROP POLICY IF EXISTS "Users create own orders" ON public.service_orders;

CREATE POLICY "Users create own orders"
ON public.service_orders
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id)
  AND (paid_amount = (0)::numeric)
  AND (current_stage = 1)
  AND (status = 'pending'::text)
  AND (admin_notes IS NULL)
  AND (stage1_completed_at IS NULL)
  AND (stage2_completed_at IS NULL)
  AND (stage3_completed_at IS NULL)
  AND (stage4_completed_at IS NULL)
  AND (total_amount = (0)::numeric)
);
