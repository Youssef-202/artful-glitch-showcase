DROP POLICY IF EXISTS "Users create own orders" ON public.service_orders;

CREATE POLICY "Users create own orders"
ON public.service_orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND paid_amount = 0
  AND current_stage = 1
  AND status = 'pending'
  AND admin_notes IS NULL
  AND stage1_completed_at IS NULL
  AND stage2_completed_at IS NULL
  AND stage3_completed_at IS NULL
  AND stage4_completed_at IS NULL
  AND total_amount >= 0
);