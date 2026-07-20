do $$
declare
  required_table text;
  required_tables text[] := array[
    'profiles',
    'measurement_units',
    'resources',
    'products',
    'recipes',
    'recipe_items',
    'purchases',
    'purchase_items',
    'resource_consumptions',
    'production_orders',
    'production_items',
    'sales',
    'sale_items',
    'inventory_movements',
    'pricing_calculations',
    'financial_movements',
    'subscriptions',
    'payments',
    'admin_users',
    'admin_audit_logs'
  ];
begin
  foreach required_table in array required_tables
  loop
    if not exists (
      select 1
      from pg_class c
      inner join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = required_table
        and c.relrowsecurity = true
    ) then
      raise exception 'RLS_NOT_ENABLED:%', required_table;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_owner_all'
  ) then
    raise exception 'MISSING_POLICY:profiles_owner_all';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory_movements'
      and policyname = 'inventory_movements_owner_all'
  ) then
    raise exception 'MISSING_POLICY:inventory_movements_owner_all';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_audit_logs'
      and policyname = 'admin_audit_logs_admin_select'
  ) then
    raise exception 'MISSING_POLICY:admin_audit_logs_admin_select';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'ensure_active_account'
  ) then
    raise exception 'MISSING_FUNCTION:ensure_active_account';
  end if;
end;
$$;
