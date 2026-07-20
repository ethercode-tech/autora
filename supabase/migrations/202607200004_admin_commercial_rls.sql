create policy "subscriptions_admin_write"
on public.subscriptions
for all
using (public.is_admin())
with check (public.is_admin());

create policy "payments_admin_write"
on public.payments
for all
using (public.is_admin())
with check (public.is_admin());
