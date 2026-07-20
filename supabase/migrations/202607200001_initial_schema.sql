create extension if not exists "pgcrypto";

create type public.business_type as enum ('manufacturer', 'reseller');
create type public.account_status as enum (
  'pending',
  'approved_pending_payment',
  'active',
  'past_due',
  'blocked',
  'rejected',
  'cancelled'
);
create type public.product_type as enum ('manufactured', 'resale');
create type public.financial_movement_type as enum ('income', 'expense');
create type public.subscription_status as enum ('pending', 'active', 'past_due', 'suspended', 'cancelled');
create type public.payment_status as enum ('pending', 'confirmed', 'rejected');
create type public.inventory_entity_type as enum ('resource', 'product');
create type public.inventory_movement_type as enum (
  'purchase_in',
  'manual_consumption_out',
  'production_resource_out',
  'production_product_in',
  'sale_out',
  'manual_adjustment_in',
  'manual_adjustment_out'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  currency text,
  business_type public.business_type,
  account_status public.account_status not null default 'pending',
  onboarding_completed boolean not null default false,
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.measurement_units (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  symbol text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint measurement_units_unique_name unique (user_id, normalized_name)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measurement_unit_id uuid not null references public.measurement_units(id),
  name text not null,
  normalized_name text not null,
  pack_quantity numeric(12, 3),
  minimum_stock numeric(12, 3),
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resources_unique_name unique (user_id, normalized_name),
  constraint resources_pack_quantity_positive check (pack_quantity is null or pack_quantity > 0),
  constraint resources_minimum_stock_non_negative check (minimum_stock is null or minimum_stock >= 0)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  description text,
  sku text,
  product_type public.product_type not null,
  sale_unit text not null default 'unidad',
  default_sale_price numeric(12, 2),
  minimum_stock numeric(12, 3),
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_unique_name unique (user_id, normalized_name),
  constraint products_default_sale_price_non_negative check (default_sale_price is null or default_sale_price >= 0),
  constraint products_minimum_stock_non_negative check (minimum_stock is null or minimum_stock >= 0)
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  name text not null,
  yield_quantity numeric(12, 3) not null,
  version integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint recipes_yield_positive check (yield_quantity > 0)
);

create table public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  resource_id uuid not null references public.resources(id),
  quantity numeric(12, 3) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint recipe_items_quantity_positive check (quantity > 0),
  constraint recipe_items_unique_resource unique (recipe_id, resource_id)
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_type public.inventory_entity_type not null,
  date date not null,
  total numeric(12, 2) not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint purchases_total_positive check (total > 0)
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  resource_id uuid references public.resources(id),
  product_id uuid references public.products(id),
  quantity numeric(12, 3) not null,
  unit_price numeric(12, 2) not null,
  total_price numeric(12, 2) not null,
  pack_quantity numeric(12, 3),
  individual_unit_price numeric(12, 6),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint purchase_items_quantity_positive check (quantity > 0),
  constraint purchase_items_unit_price_positive check (unit_price > 0),
  constraint purchase_items_total_price_positive check (total_price > 0),
  constraint purchase_items_pack_quantity_positive check (pack_quantity is null or pack_quantity > 0),
  constraint purchase_items_reference_check check (
    (resource_id is not null and product_id is null)
    or (resource_id is null and product_id is not null)
  )
);

create table public.resource_consumptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id),
  quantity numeric(12, 3) not null,
  date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint resource_consumptions_quantity_positive check (quantity > 0)
);

create table public.production_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  recipe_id uuid not null references public.recipes(id),
  quantity_produced numeric(12, 3) not null,
  total_cost numeric(12, 2),
  unit_cost numeric(12, 2),
  date date not null,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint production_orders_quantity_positive check (quantity_produced > 0)
);

create table public.production_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  production_order_id uuid not null references public.production_orders(id) on delete cascade,
  resource_id uuid not null references public.resources(id),
  quantity_used numeric(12, 3) not null,
  unit_cost numeric(12, 6),
  total_cost numeric(12, 2),
  created_at timestamptz not null default timezone('utc', now()),
  constraint production_items_quantity_positive check (quantity_used > 0)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  total numeric(12, 2) not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint sales_total_positive check (total > 0)
);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity numeric(12, 3) not null,
  unit_price numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sale_items_quantity_positive check (quantity > 0),
  constraint sale_items_unit_price_non_negative check (unit_price >= 0),
  constraint sale_items_subtotal_non_negative check (subtotal >= 0)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type public.inventory_entity_type not null,
  resource_id uuid references public.resources(id),
  product_id uuid references public.products(id),
  movement_type public.inventory_movement_type not null,
  quantity_signed numeric(12, 3) not null,
  reference_type text not null,
  reference_id uuid not null,
  date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint inventory_movement_reference_check check (
    (entity_type = 'resource' and resource_id is not null and product_id is null)
    or (entity_type = 'product' and product_id is not null and resource_id is null)
  )
);

create table public.pricing_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name_snapshot text not null,
  cost numeric(12, 2) not null,
  profit_percentage numeric(8, 2) not null,
  suggested_price numeric(12, 2) not null,
  calculation_detail jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.financial_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.financial_movement_type not null,
  amount numeric(12, 2) not null,
  date date not null,
  description text not null,
  source_type text not null,
  source_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint financial_movements_amount_positive check (amount > 0)
);

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  business_name text not null,
  requested_plan_id uuid,
  payment_proof_url text,
  status text not null default 'pending',
  requested_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price numeric(12, 2) not null,
  currency text not null,
  billing_period text not null,
  active boolean not null default true,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint plans_price_non_negative check (price >= 0)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status public.subscription_status not null default 'pending',
  starts_at date,
  ends_at date,
  next_billing_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null,
  status public.payment_status not null default 'pending',
  payment_method text,
  external_reference text,
  proof_url text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_amount_positive check (amount > 0)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.ensure_active_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_status public.account_status;
begin
  select account_status
  into profile_status
  from public.profiles
  where user_id = auth.uid();

  if profile_status is distinct from 'active' then
    raise exception 'ACCOUNT_NOT_ACTIVE';
  end if;
end;
$$;

create or replace function public.resource_stock(resource_uuid uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(quantity_signed), 0)
  from public.inventory_movements
  where resource_id = resource_uuid and entity_type = 'resource';
$$;

create or replace function public.product_stock(product_uuid uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(quantity_signed), 0)
  from public.inventory_movements
  where product_id = product_uuid and entity_type = 'product';
$$;

create or replace view public.resource_stock_view as
select
  r.id as resource_id,
  r.user_id,
  r.name,
  r.minimum_stock,
  coalesce(sum(im.quantity_signed), 0) as current_stock
from public.resources r
left join public.inventory_movements im
  on im.resource_id = r.id
group by r.id;

create or replace view public.product_stock_view as
select
  p.id as product_id,
  p.user_id,
  p.name,
  p.minimum_stock,
  coalesce(sum(im.quantity_signed), 0) as current_stock
from public.products p
left join public.inventory_movements im
  on im.product_id = p.id
group by p.id;

create or replace function public.register_purchase(
  purchase_date date,
  purchase_type public.inventory_entity_type,
  purchase_notes text,
  items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  purchase_id uuid;
  purchase_total numeric(12, 2) := 0;
  item jsonb;
  item_quantity numeric(12, 3);
  item_unit_price numeric(12, 2);
  item_total_price numeric(12, 2);
  item_resource_id uuid;
  item_product_id uuid;
begin
  perform public.ensure_active_account();

  if jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_PURCHASE';
  end if;

  for item in select * from jsonb_array_elements(items)
  loop
    item_quantity := (item ->> 'quantity')::numeric;
    item_unit_price := (item ->> 'unit_price')::numeric;
    item_total_price := coalesce((item ->> 'total_price')::numeric, item_quantity * item_unit_price);

    if item_quantity <= 0 or item_unit_price <= 0 or item_total_price <= 0 then
      raise exception 'INVALID_PURCHASE_ITEM';
    end if;

    purchase_total := purchase_total + item_total_price;
  end loop;

  insert into public.purchases (user_id, purchase_type, date, total, notes)
  values (auth.uid(), purchase_type, purchase_date, purchase_total, purchase_notes)
  returning id into purchase_id;

  for item in select * from jsonb_array_elements(items)
  loop
    item_resource_id := nullif(item ->> 'resource_id', '')::uuid;
    item_product_id := nullif(item ->> 'product_id', '')::uuid;
    item_quantity := (item ->> 'quantity')::numeric;
    item_unit_price := (item ->> 'unit_price')::numeric;
    item_total_price := coalesce((item ->> 'total_price')::numeric, item_quantity * item_unit_price);

    insert into public.purchase_items (
      user_id, purchase_id, resource_id, product_id, quantity, unit_price, total_price, pack_quantity, individual_unit_price
    )
    values (
      auth.uid(),
      purchase_id,
      item_resource_id,
      item_product_id,
      item_quantity,
      item_unit_price,
      item_total_price,
      nullif(item ->> 'pack_quantity', '')::numeric,
      nullif(item ->> 'individual_unit_price', '')::numeric
    );

    insert into public.inventory_movements (
      user_id, entity_type, resource_id, product_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
    )
    values (
      auth.uid(),
      purchase_type,
      item_resource_id,
      item_product_id,
      'purchase_in',
      item_quantity,
      'purchase',
      purchase_id,
      purchase_date,
      purchase_notes
    );
  end loop;

  insert into public.financial_movements (user_id, type, amount, date, description, source_type, source_id)
  values (auth.uid(), 'expense', purchase_total, purchase_date, 'Compra registrada', 'purchase', purchase_id);

  return purchase_id;
end;
$$;

create or replace function public.register_sale(
  sale_date date,
  sale_notes text,
  items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sale_id uuid;
  sale_total numeric(12, 2) := 0;
  item jsonb;
  item_product_id uuid;
  item_quantity numeric(12, 3);
  item_unit_price numeric(12, 2);
  item_subtotal numeric(12, 2);
begin
  perform public.ensure_active_account();

  if jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_SALE';
  end if;

  for item in select * from jsonb_array_elements(items)
  loop
    item_product_id := (item ->> 'product_id')::uuid;
    item_quantity := (item ->> 'quantity')::numeric;
    item_unit_price := (item ->> 'unit_price')::numeric;
    item_subtotal := item_quantity * item_unit_price;

    if item_quantity <= 0 or item_unit_price < 0 then
      raise exception 'INVALID_SALE_ITEM';
    end if;

    if public.product_stock(item_product_id) < item_quantity then
      raise exception 'INSUFFICIENT_PRODUCT_STOCK';
    end if;

    sale_total := sale_total + item_subtotal;
  end loop;

  insert into public.sales (user_id, date, total, notes)
  values (auth.uid(), sale_date, sale_total, sale_notes)
  returning id into sale_id;

  for item in select * from jsonb_array_elements(items)
  loop
    item_product_id := (item ->> 'product_id')::uuid;
    item_quantity := (item ->> 'quantity')::numeric;
    item_unit_price := (item ->> 'unit_price')::numeric;
    item_subtotal := item_quantity * item_unit_price;

    insert into public.sale_items (user_id, sale_id, product_id, quantity, unit_price, subtotal)
    values (auth.uid(), sale_id, item_product_id, item_quantity, item_unit_price, item_subtotal);

    insert into public.inventory_movements (
      user_id, entity_type, product_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
    )
    values (
      auth.uid(),
      'product',
      item_product_id,
      'sale_out',
      item_quantity * -1,
      'sale',
      sale_id,
      sale_date,
      sale_notes
    );
  end loop;

  insert into public.financial_movements (user_id, type, amount, date, description, source_type, source_id)
  values (auth.uid(), 'income', sale_total, sale_date, 'Venta registrada', 'sale', sale_id);

  return sale_id;
end;
$$;

create or replace function public.register_production(
  production_date date,
  production_product_id uuid,
  production_recipe_id uuid,
  production_quantity numeric,
  production_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  production_id uuid;
  recipe_item record;
  resource_needed numeric(12, 3);
begin
  perform public.ensure_active_account();

  if production_quantity <= 0 then
    raise exception 'INVALID_PRODUCTION_QUANTITY';
  end if;

  for recipe_item in
    select ri.resource_id, ri.quantity, r.yield_quantity
    from public.recipe_items ri
    inner join public.recipes r on r.id = ri.recipe_id
    where ri.recipe_id = production_recipe_id and r.user_id = auth.uid() and r.active = true
  loop
    resource_needed := (recipe_item.quantity / recipe_item.yield_quantity) * production_quantity;

    if public.resource_stock(recipe_item.resource_id) < resource_needed then
      raise exception 'INSUFFICIENT_RESOURCE_STOCK';
    end if;
  end loop;

  insert into public.production_orders (user_id, product_id, recipe_id, quantity_produced, date, notes)
  values (auth.uid(), production_product_id, production_recipe_id, production_quantity, production_date, production_notes)
  returning id into production_id;

  for recipe_item in
    select ri.resource_id, ri.quantity, r.yield_quantity
    from public.recipe_items ri
    inner join public.recipes r on r.id = ri.recipe_id
    where ri.recipe_id = production_recipe_id and r.user_id = auth.uid() and r.active = true
  loop
    resource_needed := (recipe_item.quantity / recipe_item.yield_quantity) * production_quantity;

    insert into public.production_items (user_id, production_order_id, resource_id, quantity_used)
    values (auth.uid(), production_id, recipe_item.resource_id, resource_needed);

    insert into public.inventory_movements (
      user_id, entity_type, resource_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
    )
    values (
      auth.uid(),
      'resource',
      recipe_item.resource_id,
      'production_resource_out',
      resource_needed * -1,
      'production',
      production_id,
      production_date,
      production_notes
    );
  end loop;

  insert into public.inventory_movements (
    user_id, entity_type, product_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
  )
  values (
    auth.uid(),
    'product',
    production_product_id,
    'production_product_in',
    production_quantity,
    'production',
    production_id,
    production_date,
    production_notes
  );

  return production_id;
end;
$$;

create or replace function public.adjust_inventory(
  adjustment_date date,
  adjustment_entity_type public.inventory_entity_type,
  adjustment_resource_id uuid,
  adjustment_product_id uuid,
  adjustment_quantity numeric,
  adjustment_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  movement_id uuid;
  movement_type public.inventory_movement_type;
begin
  perform public.ensure_active_account();

  if adjustment_quantity = 0 then
    raise exception 'ZERO_ADJUSTMENT';
  end if;

  movement_type := case
    when adjustment_quantity > 0 then 'manual_adjustment_in'
    else 'manual_adjustment_out'
  end;

  if adjustment_entity_type = 'resource' and public.resource_stock(adjustment_resource_id) + adjustment_quantity < 0 then
    raise exception 'INSUFFICIENT_RESOURCE_STOCK';
  end if;

  if adjustment_entity_type = 'product' and public.product_stock(adjustment_product_id) + adjustment_quantity < 0 then
    raise exception 'INSUFFICIENT_PRODUCT_STOCK';
  end if;

  insert into public.inventory_movements (
    user_id, entity_type, resource_id, product_id, movement_type, quantity_signed, reference_type, reference_id, date, notes
  )
  values (
    auth.uid(),
    adjustment_entity_type,
    adjustment_resource_id,
    adjustment_product_id,
    movement_type,
    adjustment_quantity,
    'manual_adjustment',
    gen_random_uuid(),
    adjustment_date,
    adjustment_notes
  )
  returning id into movement_id;

  return movement_id;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger measurement_units_set_updated_at before update on public.measurement_units for each row execute function public.set_updated_at();
create trigger resources_set_updated_at before update on public.resources for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger recipes_set_updated_at before update on public.recipes for each row execute function public.set_updated_at();
create trigger recipe_items_set_updated_at before update on public.recipe_items for each row execute function public.set_updated_at();
create trigger purchases_set_updated_at before update on public.purchases for each row execute function public.set_updated_at();
create trigger purchase_items_set_updated_at before update on public.purchase_items for each row execute function public.set_updated_at();
create trigger resource_consumptions_set_updated_at before update on public.resource_consumptions for each row execute function public.set_updated_at();
create trigger production_orders_set_updated_at before update on public.production_orders for each row execute function public.set_updated_at();
create trigger sales_set_updated_at before update on public.sales for each row execute function public.set_updated_at();
create trigger sale_items_set_updated_at before update on public.sale_items for each row execute function public.set_updated_at();
create trigger financial_movements_set_updated_at before update on public.financial_movements for each row execute function public.set_updated_at();
create trigger plans_set_updated_at before update on public.plans for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.measurement_units enable row level security;
alter table public.resources enable row level security;
alter table public.products enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_items enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.resource_consumptions enable row level security;
alter table public.production_orders enable row level security;
alter table public.production_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.pricing_calculations enable row level security;
alter table public.financial_movements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.access_requests enable row level security;
alter table public.plans enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "profiles_owner_select" on public.profiles for select using (auth.uid() = user_id or public.is_admin());
create policy "profiles_owner_insert" on public.profiles for insert with check (auth.uid() = user_id or public.is_admin());
create policy "profiles_owner_update" on public.profiles for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

create policy "measurement_units_owner_all" on public.measurement_units for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resources_owner_all" on public.resources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_owner_all" on public.products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipes_owner_all" on public.recipes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipe_items_owner_all" on public.recipe_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "purchases_owner_all" on public.purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "purchase_items_owner_all" on public.purchase_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resource_consumptions_owner_all" on public.resource_consumptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "production_orders_owner_all" on public.production_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "production_items_owner_all" on public.production_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sales_owner_all" on public.sales for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sale_items_owner_all" on public.sale_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inventory_movements_owner_all" on public.inventory_movements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pricing_calculations_owner_all" on public.pricing_calculations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "financial_movements_owner_all" on public.financial_movements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions_owner_select" on public.subscriptions for select using (auth.uid() = user_id or public.is_admin());
create policy "payments_owner_select" on public.payments for select using (auth.uid() = user_id or public.is_admin());

create policy "access_requests_admin_select" on public.access_requests for select using (public.is_admin());
create policy "access_requests_admin_update" on public.access_requests for update using (public.is_admin()) with check (public.is_admin());
create policy "access_requests_public_insert" on public.access_requests for insert with check (true);

create policy "plans_read_all" on public.plans for select using (true);
create policy "plans_admin_write" on public.plans for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_users_admin_only" on public.admin_users for select using (public.is_admin());
create policy "admin_users_admin_write" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
create policy "admin_audit_logs_admin_only" on public.admin_audit_logs for select using (public.is_admin());
create policy "admin_audit_logs_admin_insert" on public.admin_audit_logs for insert with check (public.is_admin());
