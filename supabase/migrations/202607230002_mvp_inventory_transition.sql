-- AUTORA MVP forward migration.
-- This intentionally preserves the legacy schema and data.  The legacy schema
-- contains more tables than the MVP; dropping them here would be destructive.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists is_admin boolean not null default false;

alter table public.resources
  add column if not exists unit text,
  add column if not exists current_stock numeric(12, 3) not null default 0;
alter table public.resources alter column measurement_unit_id drop not null;

alter table public.products
  add column if not exists current_stock numeric(12, 3) not null default 0;
alter table public.products alter column product_type set default 'manufactured';

alter table public.purchases
  add column if not exists resource_id uuid references public.resources(id),
  add column if not exists quantity numeric(12, 3),
  add column if not exists price_paid numeric(12, 2);
alter table public.purchases alter column purchase_type set default 'resource';
alter table public.purchases alter column total set default 0;

alter table public.sales
  add column if not exists product_id uuid references public.products(id),
  add column if not exists quantity numeric(12, 3),
  add column if not exists unit_price numeric(12, 2);
alter table public.sales alter column total set default 0;

alter table public.subscriptions
  add column if not exists is_active boolean not null default false;
alter table public.subscriptions alter column plan_id drop not null;

alter table public.access_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists public.productions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(12, 3) not null check (quantity > 0),
  date date not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pricing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  total_cost numeric(12, 2) not null check (total_cost >= 0),
  profit_percentage numeric(8, 2) not null check (profit_percentage >= 0),
  suggested_price numeric(12, 2) not null check (suggested_price >= 0),
  resources_used jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists resources_user_id_idx on public.resources(user_id);
create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists purchases_user_resource_date_idx on public.purchases(user_id, resource_id, date desc);
create index if not exists productions_user_product_date_idx on public.productions(user_id, product_id, date desc);
create index if not exists sales_user_product_date_idx on public.sales(user_id, product_id, date desc);
create index if not exists pricing_history_user_product_created_idx on public.pricing_history(user_id, product_id, created_at desc);
create unique index if not exists profiles_email_unique_idx on public.profiles(lower(email)) where email is not null;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where user_id = auth.uid() and is_admin = true
  ) or exists (
    select 1 from public.admin_users where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.ensure_mvp_active_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where user_id = auth.uid() and account_status = 'active'
  ) then
    raise exception 'ACCOUNT_NOT_ACTIVE';
  end if;
end;
$$;

create or replace function public.mvp_protect_profile_state()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() = old.user_id and not public.is_admin()
    and (new.account_status is distinct from old.account_status or new.is_admin is distinct from old.is_admin) then
    raise exception 'ACCOUNT_STATE_MANAGED_BY_ADMIN';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_mvp_protect_state on public.profiles;
create trigger profiles_mvp_protect_state before update on public.profiles
for each row execute function public.mvp_protect_profile_state();

create or replace function public.mvp_normalize_catalog_row()
returns trigger language plpgsql as $$
begin
  new.normalized_name := lower(trim(new.name));
  if tg_table_name = 'resources' and coalesce(new.unit, '') = '' then
    select symbol into new.unit from public.measurement_units where id = new.measurement_unit_id;
    if coalesce(new.unit, '') = '' then
      raise exception 'RESOURCE_UNIT_REQUIRED';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists resources_mvp_normalize on public.resources;
create trigger resources_mvp_normalize before insert or update of name, unit on public.resources
for each row execute function public.mvp_normalize_catalog_row();
drop trigger if exists products_mvp_normalize on public.products;
create trigger products_mvp_normalize before insert or update of name on public.products
for each row execute function public.mvp_normalize_catalog_row();

create or replace function public.mvp_protect_stock()
returns trigger language plpgsql as $$
begin
  if new.current_stock is distinct from old.current_stock
    and current_setting('app.mvp_stock_mutation', true) is distinct from 'on' then
    raise exception 'STOCK_IS_MANAGED_BY_TRANSACTIONS';
  end if;
  return new;
end;
$$;

drop trigger if exists resources_mvp_protect_stock on public.resources;
create trigger resources_mvp_protect_stock before update on public.resources
for each row execute function public.mvp_protect_stock();
drop trigger if exists products_mvp_protect_stock on public.products;
create trigger products_mvp_protect_stock before update on public.products
for each row execute function public.mvp_protect_stock();

create or replace function public.mvp_adjust_resource_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare delta numeric(12, 3);
begin
  perform set_config('app.mvp_stock_mutation', 'on', true);
  if tg_op = 'INSERT' then delta := new.quantity;
  elsif tg_op = 'DELETE' then delta := -old.quantity;
  else delta := coalesce(new.quantity, 0) - coalesce(old.quantity, 0); end if;
  if coalesce(case when tg_op = 'DELETE' then old.resource_id else new.resource_id end, null) is not null then
    update public.resources
      set current_stock = current_stock + delta
      where id = case when tg_op = 'DELETE' then old.resource_id else new.resource_id end;
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.mvp_adjust_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare delta numeric(12, 3);
begin
  perform set_config('app.mvp_stock_mutation', 'on', true);
  if tg_table_name = 'productions' then
    if tg_op = 'INSERT' then delta := new.quantity;
    elsif tg_op = 'DELETE' then delta := -old.quantity;
    else delta := new.quantity - old.quantity; end if;
  else
    if tg_op = 'INSERT' then delta := -new.quantity;
    elsif tg_op = 'DELETE' then delta := old.quantity;
    else delta := old.quantity - new.quantity; end if;
  end if;
  update public.products set current_stock = current_stock + delta
    where id = case when tg_op = 'DELETE' then old.product_id else new.product_id end;
  return coalesce(new, old);
end;
$$;

create or replace function public.mvp_validate_purchase()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.ensure_mvp_active_account();
  if new.resource_id is null or new.quantity is null or new.quantity <= 0 or new.price_paid is null or new.price_paid <= 0 then
    raise exception 'INVALID_PURCHASE';
  end if;
  if not exists (select 1 from public.resources where id = new.resource_id and user_id = auth.uid()) then
    raise exception 'RESOURCE_NOT_OWNED';
  end if;
  new.user_id := auth.uid(); new.purchase_type := 'resource'; new.total := new.price_paid;
  return new;
end;
$$;

create or replace function public.mvp_validate_production()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.ensure_mvp_active_account();
  if not exists (select 1 from public.products where id = new.product_id and user_id = auth.uid()) then raise exception 'PRODUCT_NOT_OWNED'; end if;
  new.user_id := auth.uid();
  return new;
end;
$$;

create or replace function public.mvp_validate_sale()
returns trigger language plpgsql security definer set search_path = public as $$
declare available_stock numeric(12, 3); required_stock numeric(12, 3);
begin
  perform public.ensure_mvp_active_account();
  if new.product_id is null or new.quantity is null or new.quantity <= 0 or new.unit_price is null or new.unit_price < 0 then raise exception 'INVALID_SALE'; end if;
  select current_stock into available_stock from public.products where id = new.product_id and user_id = auth.uid() for update;
  if not found then raise exception 'PRODUCT_NOT_OWNED'; end if;
  required_stock := new.quantity - case when tg_op = 'UPDATE' and old.product_id = new.product_id then old.quantity else 0 end;
  if available_stock < required_stock then raise exception 'INSUFFICIENT_PRODUCT_STOCK'; end if;
  new.user_id := auth.uid(); new.total := round((new.quantity * new.unit_price)::numeric, 2);
  return new;
end;
$$;

drop trigger if exists purchases_mvp_validate on public.purchases;
create trigger purchases_mvp_validate before insert or update on public.purchases for each row execute function public.mvp_validate_purchase();
drop trigger if exists purchases_mvp_stock on public.purchases;
create trigger purchases_mvp_stock after insert or update or delete on public.purchases for each row execute function public.mvp_adjust_resource_stock();
drop trigger if exists productions_mvp_validate on public.productions;
create trigger productions_mvp_validate before insert or update on public.productions for each row execute function public.mvp_validate_production();
drop trigger if exists productions_mvp_stock on public.productions;
create trigger productions_mvp_stock after insert or update or delete on public.productions for each row execute function public.mvp_adjust_product_stock();
drop trigger if exists sales_mvp_validate on public.sales;
create trigger sales_mvp_validate before insert or update on public.sales for each row execute function public.mvp_validate_sale();
drop trigger if exists sales_mvp_stock on public.sales;
create trigger sales_mvp_stock after insert or update or delete on public.sales for each row execute function public.mvp_adjust_product_stock();

create or replace function public.register_mvp_purchase(purchase_date date, purchase_resource_id uuid, purchase_quantity numeric, purchase_price_paid numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare purchase_id uuid;
begin
  insert into public.purchases(user_id, resource_id, quantity, price_paid, date)
  values (auth.uid(), purchase_resource_id, purchase_quantity, purchase_price_paid, purchase_date)
  returning id into purchase_id;
  return purchase_id;
end; $$;

create or replace function public.register_mvp_production(production_date date, production_product_id uuid, production_quantity numeric, production_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare production_id uuid;
begin
  insert into public.productions(user_id, product_id, quantity, date, note)
  values (auth.uid(), production_product_id, production_quantity, production_date, production_note)
  returning id into production_id;
  return production_id;
end; $$;

create or replace function public.register_mvp_sale(sale_date date, sale_product_id uuid, sale_quantity numeric, sale_unit_price numeric, sale_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare sale_id uuid;
begin
  insert into public.sales(user_id, product_id, quantity, unit_price, date, notes)
  values (auth.uid(), sale_product_id, sale_quantity, sale_unit_price, sale_date, sale_note)
  returning id into sale_id;
  return sale_id;
end; $$;

create or replace function public.admin_set_account(target_user_id uuid, target_status public.account_status, subscription_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  if target_status not in ('pending', 'active', 'blocked') then raise exception 'INVALID_ACCOUNT_STATUS'; end if;
  update public.profiles set account_status = target_status where user_id = target_user_id;
  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  insert into public.subscriptions(user_id, status, is_active)
  values (target_user_id, case when subscription_active then 'active'::public.subscription_status else 'pending'::public.subscription_status end, subscription_active)
  on conflict (user_id) do update set
    is_active = excluded.is_active,
    status = excluded.status,
    updated_at = timezone('utc', now());
end; $$;

create or replace function public.admin_resolve_access_request(request_id uuid, approved boolean)
returns void language plpgsql security definer set search_path = public as $$
declare request_email text;
begin
  if not public.is_admin() then raise exception 'ADMIN_REQUIRED'; end if;
  update public.access_requests
    set status = case when approved then 'approved' else 'rejected' end,
        resolved_at = timezone('utc', now()), resolved_by = auth.uid()
    where id = request_id
    returning email into request_email;
  if request_email is null then raise exception 'ACCESS_REQUEST_NOT_FOUND'; end if;
  update public.profiles
    set account_status = case when approved then 'active'::public.account_status else 'blocked'::public.account_status end
    where lower(email) = lower(request_email);
end; $$;

create or replace function public.handle_mvp_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare request_status text;
begin
  select status into request_status from public.access_requests where lower(email) = lower(new.email) order by requested_at desc limit 1;
  insert into public.profiles(user_id, name, email, business_name, account_status)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email, new.raw_user_meta_data ->> 'business_name', case when request_status = 'approved' then 'active'::public.account_status else 'pending'::public.account_status end)
  on conflict (user_id) do update set email = excluded.email, name = coalesce(nullif(excluded.name, ''), public.profiles.name);
  update public.access_requests set user_id = new.id where lower(email) = lower(new.email) and user_id is null;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_mvp on auth.users;
create trigger on_auth_user_created_mvp after insert on auth.users for each row execute function public.handle_mvp_new_user();

alter table public.productions enable row level security;
alter table public.pricing_history enable row level security;
drop policy if exists productions_owner_all on public.productions;
create policy productions_owner_all on public.productions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists pricing_history_owner_all on public.pricing_history;
create policy pricing_history_owner_all on public.pricing_history for all using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on function public.register_mvp_purchase(date, uuid, numeric, numeric) from public;
revoke all on function public.register_mvp_production(date, uuid, numeric, text) from public;
revoke all on function public.register_mvp_sale(date, uuid, numeric, numeric, text) from public;
revoke all on function public.admin_set_account(uuid, public.account_status, boolean) from public;
revoke all on function public.admin_resolve_access_request(uuid, boolean) from public;
grant execute on function public.register_mvp_purchase(date, uuid, numeric, numeric) to authenticated;
grant execute on function public.register_mvp_production(date, uuid, numeric, text) to authenticated;
grant execute on function public.register_mvp_sale(date, uuid, numeric, numeric, text) to authenticated;
grant execute on function public.admin_set_account(uuid, public.account_status, boolean) to authenticated;
grant execute on function public.admin_resolve_access_request(uuid, boolean) to authenticated;
