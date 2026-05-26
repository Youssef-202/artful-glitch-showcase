DROP POLICY IF EXISTS "Users and admins insert messages" ON public.order_messages;
CREATE POLICY "Users and admins insert messages"
ON public.order_messages FOR INSERT
WITH CHECK (
  (auth.uid() = user_id
   AND sender = 'user'
   AND EXISTS (
     SELECT 1 FROM public.service_orders
     WHERE id = order_id AND user_id = auth.uid()
   ))
  OR has_role(auth.uid(), 'admin'::app_role)
);