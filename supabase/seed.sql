insert into public.plans (name, description, price, currency, billing_period, features)
values
  ('Esencial', 'Plan base para emprendimientos chicos.', 12000, 'ARS', 'monthly', '{"users": 1, "businesses": 1}'::jsonb),
  ('Impulso', 'Plan con seguimiento operativo completo.', 18000, 'ARS', 'monthly', '{"users": 1, "businesses": 1}'::jsonb)
on conflict (name) do nothing;
