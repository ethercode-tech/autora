-- Datos mínimos para que el panel administrativo pueda identificar cuentas
-- sin leer directamente el esquema auth desde el navegador.
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text;

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email))
  where email is not null;

-- El MVP no comercializa planes: la suscripción se activa manualmente por cuenta.
alter table public.subscriptions
  alter column plan_id drop not null;

create index if not exists subscriptions_user_created_at_idx
  on public.subscriptions (user_id, created_at desc);
