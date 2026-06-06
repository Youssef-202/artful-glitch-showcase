
-- Add explicit auth.uid() IS NOT NULL guards to admin-only policies (defense in depth)

-- service_orders
DROP POLICY IF EXISTS "Admins update orders" ON public.service_orders;
CREATE POLICY "Admins update orders" ON public.service_orders
  FOR UPDATE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete orders" ON public.service_orders;
CREATE POLICY "Admins delete orders" ON public.service_orders
  FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- payments
DROP POLICY IF EXISTS "Admins insert payments" ON public.payments;
CREATE POLICY "Admins insert payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update payments" ON public.payments;
CREATE POLICY "Admins update payments" ON public.payments
  FOR UPDATE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete payments" ON public.payments;
CREATE POLICY "Admins delete payments" ON public.payments
  FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

-- order_messages
DROP POLICY IF EXISTS "Admins update messages" ON public.order_messages;
CREATE POLICY "Admins update messages" ON public.order_messages
  FOR UPDATE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete messages" ON public.order_messages;
CREATE POLICY "Admins delete messages" ON public.order_messages
  FOR DELETE USING (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role));
